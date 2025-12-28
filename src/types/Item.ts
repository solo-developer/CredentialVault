export default interface Item {
  id: string;
  folderId: string;
  name: string;
  username?: string;
  password?: string;
  url?: string;
  customFields?: any[];
  content?: string; // For Secure Notes
  type: 'credential' | 'note';
}