import { X, Droplets, Heart, Trash2 } from 'lucide-react';
import { Plant } from '../lib/supabase';

type PlantModalProps = {
  plant: Plant;
  onClose: () => void;
  onWater: () => void;
  onCare: () => void;
  onRemove: () => void;
};

export function PlantModal({ plant, onClose, onWater, onCare, onRemove }: PlantModalProps) {
  const getPlantName = () => {
    const names = {
      flower: 'Flower',
      tree: 'Tree',
      succulent: 'Succulent',
      mushroom: 'Mushroom',
    };
    return names[plant.type];
  };

  const getGrowthStage = () => {
    const stages = ['Seed', 'Sprout', 'Seedling', 'Young', 'Mature', 'Blooming'];
    return stages[Math.min(plant.growth_stage, 5)];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-slide-up">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{getPlantName()}</h2>
            <p className="text-sm text-gray-500 mt-1">{getGrowthStage()} Stage</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Droplets size={16} className="text-blue-500" />
                Water Level
              </span>
              <span className="text-sm font-semibold text-gray-800">{plant.water_level}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500 rounded-full"
                style={{ width: `${plant.water_level}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Heart size={16} className="text-pink-500" />
                Happiness
              </span>
              <span className="text-sm font-semibold text-gray-800">{plant.happiness}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-pink-500 transition-all duration-500 rounded-full"
                style={{ width: `${plant.happiness}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onWater}
            disabled={plant.water_level >= 100}
            className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white py-3 rounded-2xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Droplets size={18} />
            Water
          </button>
          <button
            onClick={onCare}
            disabled={plant.happiness >= 100}
            className="flex-1 bg-gradient-to-r from-pink-400 to-pink-500 text-white py-3 rounded-2xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Heart size={18} />
            Care
          </button>
        </div>

        <button
          onClick={onRemove}
          className="w-full mt-3 bg-red-50 text-red-600 py-3 rounded-2xl font-medium hover:bg-red-100 transition-all flex items-center justify-center gap-2"
        >
          <Trash2 size={18} />
          Remove Plant
        </button>
      </div>
    </div>
  );
}
