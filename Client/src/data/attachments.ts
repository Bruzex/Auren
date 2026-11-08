import { CameraIcon, FileTextIcon, ImageIcon, MapPinIcon, type LucideIcon } from 'lucide-react';

export const attachmentOptions: {id: string;label: string;icon: LucideIcon;tint: string;}[] = [
{ id: 'photos', label: 'Photos & videos', icon: ImageIcon, tint: 'text-accent-soft' },
{ id: 'camera', label: 'Camera', icon: CameraIcon, tint: 'text-iris-soft' },
{ id: 'document', label: 'Document', icon: FileTextIcon, tint: 'text-label-secondary' },
{ id: 'location', label: 'Location', icon: MapPinIcon, tint: 'text-online' }];