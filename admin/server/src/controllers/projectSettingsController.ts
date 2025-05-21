import { Request, Response } from 'express';
import { supabase } from '../utils/supabaseClient';

export const getProjectSettings = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('project_settings')
      .select('*')
      .single();

    if (error) throw error;

    return res.status(200).json(data || {
      projectName: 'GramX Game',
      responseDelay: 1000,
      maxTokens: 150,
      temperature: 0.7,
      isActive: true,
      defaultProject: 'gramx'
    });
  } catch (error) {
    console.error('Error fetching project settings:', error);
    return res.status(500).json({ error: 'Failed to fetch project settings' });
  }
};

export const updateProjectSettings = async (req: Request, res: Response) => {
  try {
    const settings = req.body;

    const { data, error } = await supabase
      .from('project_settings')
      .upsert({
        projectName: settings.projectName,
        responseDelay: settings.responseDelay,
        maxTokens: settings.maxTokens,
        temperature: settings.temperature,
        isActive: settings.isActive,
        defaultProject: settings.defaultProject,
        updatedAt: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error updating project settings:', error);
    return res.status(500).json({ error: 'Failed to update project settings' });
  }
}; 