interface CardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: number;
}

export function Card({ title, value, icon, change }: CardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          {title}
        </h3>
        {icon}
      </div>
      <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
      {change !== undefined && (
        <div
          className={`mt-2 flex items-center text-sm ${
            change >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          <span>{change}% from last month</span>
        </div>
      )}
    </div>
  );
}
