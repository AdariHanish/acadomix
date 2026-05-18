// Database Types matching TiDB Schema

export interface Lead {
  id: number;
  name: string;
  college: string;
  branch: string;
  project_domain: string;
  budget: string;
  deadline: string;
  phone: string;
  message: string;
  status: 'new' | 'contacted' | 'in_progress' | 'completed';
  created_at: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  category: 'mini' | 'major' | 'website' | 'assignment' | 'research' | 'custom' | 'aiml' | 'datascience' | 'iot' | 'plagiarism';
  year_type: string;
  original_price: number;
  market_price: number;
  our_price: number;
  features: string;
  is_popular: boolean;
  is_trending: boolean;
  created_at: string;
}

export interface Payment {
  id: number;
  student_name: string;
  phone: string;
  email: string;
  project_name: string;
  amount: number;
  screenshot_data: string; // Base64
  mime_type: string;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

export interface Review {
  id: number;
  student_name: string;
  college_name: string;
  year_of_study: string;
  project_name: string;
  project_type: string;
  team_members?: string;
  rating: number;
  experience: string;
  pricing_review: string;
  date: string;
  is_approved: boolean;
  created_at: string;
}

export interface AppAsset {
  id: number;
  asset_name: string;
  mime_type: string;
  data: string; // Base64
  updated_at: string;
}

export interface SiteSettings {
  mini_project_price: string;
  major_project_price: string;
  custom_project_price: string;
  research_paper_price: string;
  plagiarism_removal_price: string;
  admin_password: string;
  security_question: string;
  security_answer: string;
  company_tagline?: string;
  office_location_text?: string;
  office_location_link?: string;
}
