import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
  strokeWidth?: number | string;
}

export const CategoryIcon = ({ name, ...props }: CategoryIconProps) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.Tag;
  return <Icon {...props} />;
};
