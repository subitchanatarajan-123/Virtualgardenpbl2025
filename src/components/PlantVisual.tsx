import { Plant } from '../lib/supabase';

type PlantVisualProps = {
  plant: Plant;
  onClick?: () => void;
};

export function PlantVisual({ plant, onClick }: PlantVisualProps) {
  const stage = Math.min(plant.growth_stage, 5);
  const happiness = plant.happiness;
  const isHealthy = plant.water_level > 30 && happiness > 30;

  const getPlantEmoji = () => {
    if (!isHealthy && stage > 0) {
      return '🥀';
    }

    switch (plant.type) {
      case 'flower':
        if (stage === 0) return '🌱';
        if (stage === 1) return '🌿';
        if (stage === 2) return '☘️';
        if (stage === 3) return '🌸';
        if (stage === 4) return '🌺';
        return '🌻';
      case 'tree':
        if (stage === 0) return '🌱';
        if (stage === 1) return '🌿';
        if (stage === 2) return '🪴';
        if (stage === 3) return '🌳';
        if (stage === 4) return '🌲';
        return '🌴';
      case 'succulent':
        if (stage === 0) return '🌱';
        if (stage === 1) return '🌿';
        if (stage === 2) return '🪴';
        if (stage === 3) return '🌵';
        if (stage === 4) return '🌵';
        return '🌵';
      case 'mushroom':
        if (stage === 0) return '🌱';
        if (stage === 1) return '🌿';
        if (stage === 2) return '🍄';
        if (stage === 3) return '🍄';
        if (stage === 4) return '🍄';
        return '🍄';
      default:
        return '🌱';
    }
  };

  const getSize = () => {
    const baseSize = 2 + stage * 0.5;
    return `${baseSize}rem`;
  };

  const getWaterIndicator = () => {
    if (plant.water_level < 30) return '💧';
    return '';
  };

  return (
    <button
      onClick={onClick}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 hover:scale-110 cursor-pointer group"
      style={{
        left: `${plant.position_x}%`,
        top: `${plant.position_y}%`,
        fontSize: getSize(),
      }}
    >
      <div className="relative animate-sway">
        <div className={`transition-all duration-300 ${!isHealthy ? 'opacity-60' : ''}`}>
          {getPlantEmoji()}
        </div>
        {getWaterIndicator() && (
          <div className="absolute -top-2 -right-2 text-xs animate-bounce">
            {getWaterIndicator()}
          </div>
        )}
        {happiness > 80 && isHealthy && stage >= 3 && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-xs animate-float">
            ✨
          </div>
        )}
      </div>
    </button>
  );
}
