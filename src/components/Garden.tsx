import { useState, useEffect } from 'react';
import { Sparkles, LogOut } from 'lucide-react';
import { supabase, Plant } from '../lib/supabase';
import { PlantVisual } from './PlantVisual';
import { PlantModal } from './PlantModal';

type GardenProps = {
  gardenId: string;
  onSignOut: () => void;
};

export function Garden({ gardenId, onSignOut }: GardenProps) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [plantTypes] = useState<Plant['type'][]>(['flower', 'tree', 'succulent', 'mushroom']);
  const [showPlantMenu, setShowPlantMenu] = useState(false);

  useEffect(() => {
    loadPlants();
    const interval = setInterval(updatePlantStats, 60000);
    return () => clearInterval(interval);
  }, [gardenId]);

  const loadPlants = async () => {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('garden_id', gardenId);

    if (error) {
      console.error('Error loading plants:', error);
      return;
    }

    setPlants(data || []);
  };

  const updatePlantStats = async () => {
    const now = new Date();
    const updatedPlants = plants.map((plant) => {
      const lastVisit = new Date(plant.last_visited);
      const hoursSinceVisit = (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60);

      const lastWater = new Date(plant.last_watered);
      const hoursSinceWater = (now.getTime() - lastWater.getTime()) / (1000 * 60 * 60);

      let newWaterLevel = Math.max(0, plant.water_level - hoursSinceWater * 2);
      let newHappiness = Math.max(0, plant.happiness - hoursSinceVisit * 1);

      let newGrowthStage = plant.growth_stage;
      if (plant.water_level > 50 && plant.happiness > 50 && plant.growth_stage < 5) {
        const daysSincePlanted = (now.getTime() - new Date(plant.created_at).getTime()) / (1000 * 60 * 60 * 24);
        newGrowthStage = Math.min(5, Math.floor(daysSincePlanted / 2));
      }

      return {
        ...plant,
        water_level: Math.round(newWaterLevel),
        happiness: Math.round(newHappiness),
        growth_stage: newGrowthStage,
      };
    });

    for (const plant of updatedPlants) {
      await supabase
        .from('plants')
        .update({
          water_level: plant.water_level,
          happiness: plant.happiness,
          growth_stage: plant.growth_stage,
          last_visited: now.toISOString(),
        })
        .eq('id', plant.id);
    }

    setPlants(updatedPlants);
  };

  const addPlant = async (type: Plant['type']) => {
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 80 + 10;

    const { data, error } = await supabase
      .from('plants')
      .insert({
        garden_id: gardenId,
        type,
        position_x: Math.round(x),
        position_y: Math.round(y),
        growth_stage: 0,
        water_level: 100,
        happiness: 100,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding plant:', error);
      return;
    }

    if (data) {
      setPlants([...plants, data]);
      setShowPlantMenu(false);
    }
  };

  const waterPlant = async (plant: Plant) => {
    const newWaterLevel = Math.min(100, plant.water_level + 30);

    const { error } = await supabase
      .from('plants')
      .update({
        water_level: newWaterLevel,
        last_watered: new Date().toISOString(),
      })
      .eq('id', plant.id);

    if (error) {
      console.error('Error watering plant:', error);
      return;
    }

    setPlants(plants.map((p) => (p.id === plant.id ? { ...p, water_level: newWaterLevel } : p)));
    setSelectedPlant({ ...plant, water_level: newWaterLevel });
  };

  const carePlant = async (plant: Plant) => {
    const newHappiness = Math.min(100, plant.happiness + 20);

    const { error } = await supabase
      .from('plants')
      .update({ happiness: newHappiness })
      .eq('id', plant.id);

    if (error) {
      console.error('Error caring for plant:', error);
      return;
    }

    setPlants(plants.map((p) => (p.id === plant.id ? { ...p, happiness: newHappiness } : p)));
    setSelectedPlant({ ...plant, happiness: newHappiness });
  };

  const removePlant = async (plant: Plant) => {
    const { error } = await supabase.from('plants').delete().eq('id', plant.id);

    if (error) {
      console.error('Error removing plant:', error);
      return;
    }

    setPlants(plants.filter((p) => p.id !== plant.id));
    setSelectedPlant(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-pink-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsIDAsIDAsIDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="relative z-10">
        <header className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🌿</div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">My Garden</h1>
              <p className="text-sm text-gray-500">{plants.length} plants growing</p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full transition-all shadow-sm"
          >
            <LogOut size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Sign Out</span>
          </button>
        </header>

        <div className="relative h-[calc(100vh-120px)] mx-6 mb-6 bg-white bg-opacity-40 backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden">
          {plants.map((plant) => (
            <PlantVisual
              key={plant.id}
              plant={plant}
              onClick={() => setSelectedPlant(plant)}
            />
          ))}

          {plants.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🌱</div>
                <p className="text-gray-600 text-lg font-medium mb-2">Your garden is empty</p>
                <p className="text-gray-400 text-sm">Click the button below to plant your first seed</p>
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-6 right-6">
          {showPlantMenu && (
            <div className="mb-3 bg-white rounded-2xl shadow-xl p-4 space-y-2 animate-slide-up">
              {plantTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => addPlant(type)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-100 to-blue-100 hover:from-green-200 hover:to-blue-200 rounded-xl text-gray-700 font-medium transition-all flex items-center justify-between"
                >
                  <span className="capitalize">{type}</span>
                  <span className="text-2xl">
                    {type === 'flower' && '🌸'}
                    {type === 'tree' && '🌳'}
                    {type === 'succulent' && '🌵'}
                    {type === 'mushroom' && '🍄'}
                  </span>
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowPlantMenu(!showPlantMenu)}
            className="w-14 h-14 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center transform hover:scale-110"
          >
            <Sparkles size={24} />
          </button>
        </div>
      </div>

      {selectedPlant && (
        <PlantModal
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
          onWater={() => waterPlant(selectedPlant)}
          onCare={() => carePlant(selectedPlant)}
          onRemove={() => removePlant(selectedPlant)}
        />
      )}
    </div>
  );
}
