const conversationState = new Map();

const ConversationState = {
  createState() {
    return {
      lastTopic: null,
      topics: new Set(), // All topics discussed
      hasSharedCommunity: false,
      lastMessageTimestamp: Date.now(),
      messageCount: 0,
      userPreferences: {
        interests: new Set(),
        knownTopics: new Set(),
        responseStyle: 'neutral',
        engagementLevel: 'new' // new, interested, engaged, member
      },
      context: {
        lastQuestion: null,
        pendingFollowUp: null,
        unansweredQueries: [],
        lastResponseType: null
      },
      metrics: {
        topicFrequency: {},
        positiveResponses: 0,
        negativeResponses: 0,
        questionsAsked: 0
      }
    };
  },

  updateState(chatId, update) {
    const state = this.getState(chatId);
    const newState = {
      ...state,
      lastMessageTimestamp: Date.now(),
      messageCount: state.messageCount + 1
    };

    // Update topics
    if (update.topic) {
      newState.lastTopic = update.topic;
      newState.topics.add(update.topic);
      newState.metrics.topicFrequency[update.topic] = 
        (newState.metrics.topicFrequency[update.topic] || 0) + 1;
    }

    // Update user preferences
    if (update.interests) {
      update.interests.forEach(interest => 
        newState.userPreferences.interests.add(interest));
    }

    // Update context
    if (update.context) {
      newState.context = {
        ...newState.context,
        ...update.context
      };
    }

    // Update metrics
    if (update.sentiment) {
      if (update.sentiment === 'positive') newState.metrics.positiveResponses++;
      if (update.sentiment === 'negative') newState.metrics.negativeResponses++;
    }

    if (update.isQuestion) {
      newState.metrics.questionsAsked++;
      newState.context.lastQuestion = update.question;
    }

    // Update engagement level based on interaction patterns
    this.updateEngagementLevel(newState);

    conversationState.set(chatId, newState);
    return newState;
  },

  getState(chatId) {
    if (!conversationState.has(chatId)) {
      conversationState.set(chatId, this.createState());
    }
    return conversationState.get(chatId);
  },

  updateEngagementLevel(state) {
    const { messageCount, metrics, topics } = state;
    const { positiveResponses, questionsAsked } = metrics;
    
    if (messageCount > 20 && positiveResponses > 5 && topics.size > 3) {
      state.userPreferences.engagementLevel = 'engaged';
    } else if (messageCount > 10 && positiveResponses > 2) {
      state.userPreferences.engagementLevel = 'interested';
    } else if (messageCount > 5) {
      state.userPreferences.engagementLevel = 'active';
    }
  },

  wasRecentlyDiscussed(chatId, topic) {
    const state = this.getState(chatId);
    const topicFrequency = state.metrics.topicFrequency[topic] || 0;
    const timeSinceLastMessage = Date.now() - state.lastMessageTimestamp;
    
    // Consider a topic "recent" if discussed in last 5 minutes and mentioned less than 3 times
    return timeSinceLastMessage < 5 * 60 * 1000 && topicFrequency < 3;
  },

  getPendingInteractions(chatId) {
    const state = this.getState(chatId);
    return {
      followUp: state.context.pendingFollowUp,
      lastQuestion: state.context.lastQuestion
    };
  }
};

module.exports = { ConversationState }; 