interface PageHeaderProps {
    title: string;
    action?: React.ReactNode;
  }
  
  export const PageHeader = ({ title, action }: PageHeaderProps) => {
    return (
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        {action && <div>{action}</div>}
      </div>
    );
  };