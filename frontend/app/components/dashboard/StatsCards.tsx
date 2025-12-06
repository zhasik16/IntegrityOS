import { BarChart3, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';
import { DashboardStats } from '@/lib/types';

interface StatsCardsProps {
  stats: DashboardStats;
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  const cards = [
    {
      title: 'Всего объектов',
      value: stats.total_objects.toString(),
      icon: <BarChart3 className="stat-icon-inner" />,
      cardClass: 'stat-card stat-card-blue',
      valueClass: 'stat-value stat-value-blue',
      iconClass: 'stat-icon stat-icon-blue'
    },
    {
      title: 'Обследований',
      value: stats.total_diagnostics.toString(),
      icon: <CheckCircle className="stat-icon-inner" />,
      cardClass: 'stat-card stat-card-green',
      valueClass: 'stat-value stat-value-green',
      iconClass: 'stat-icon stat-icon-green'
    },
    {
      title: 'Дефектов',
      value: stats.defects_count.toString(),
      icon: <AlertTriangle className="stat-icon-inner" />,
      cardClass: 'stat-card stat-card-red',
      valueClass: 'stat-value stat-value-red',
      iconClass: 'stat-icon stat-icon-red'
    },
    {
      title: 'Требуют мер',
      value: Math.floor(stats.defects_count * 0.4).toString(),
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