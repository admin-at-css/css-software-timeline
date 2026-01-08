import type { Stakeholder } from '../../types/project';

interface StakeholderListProps {
  stakeholders: Stakeholder[];
}

export function StakeholderList({ stakeholders }: StakeholderListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Stakeholders</h3>
      <div className="space-y-2">
        {stakeholders.map((stakeholder, index) => (
          <div
            key={index}
            className="flex items-center gap-3 bg-gray-50 rounded-lg p-2"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
              {getInitials(stakeholder.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {stakeholder.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{stakeholder.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
