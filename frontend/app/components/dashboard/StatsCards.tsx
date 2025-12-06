import { BarChart3, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';
import { DashboardStats } from '@/lib/types';

interface StatsCardsProps {
  stats: DashboardStats;
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  // Используем правильные поля из DashboardStats
  const cards = [
    {
      title: 'Всего объектов',
      value: stats?.total_objects?.toString() || '0',
      icon: <BarChart3 className="stat-icon-inner" />,
      cardClass: 'stat-card stat-card-blue',
      valueClass: 'stat-value stat-value-blue',
      iconClass: 'stat-icon stat-icon-blue'
    },
    {
      title: 'Обследований',
      value: stats?.total_inspections?.toString() || '0',
      icon: <CheckCircle className="stat-icon-inner" />,
      cardClass: 'stat-card stat-card-green',
      valueClass: 'stat-value stat-value-green',
      iconClass: 'stat-icon stat-icon-green'
    },
    {
      title: 'Дефектов',
      value: stats?.total_defects?.toString() || '0',
      icon: <AlertTriangle className="stat-icon-inner" />,
      cardClass: 'stat-card stat-card-red',
      valueClass: 'stat-value stat-value-red',
      iconClass: 'stat-icon stat-icon-red'
    },
    {
      title: 'Процент дефектов',
      value: `${stats?.defect_rate?.toFixed(1) || '0'}%`,
      icon: <Wrench className="stat-icon-inner" />,
      cardClass: 'stat-card stat-card-yellow',
      valueClass: 'stat-value stat-value-yellow',
      iconClass: 'stat-icon stat-icon-yellow'
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, index) => (
        <div key={index} className={card.cardClass}>
          <div className="stat-info">
            <h3>{card.title}</h3>
            <div className={card.valueClass}>{card.value}</div>
          </div>
          <div className={card.iconClass}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;