
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  gradient: string;
}

const themes: Theme[] = [
  {
    id: 'sunset',
    name: 'Sunset Glow',
    colors: {
      primary: '#FF6B6B',
      secondary: '#FFE66D',
      accent: '#FF8E53',
      text: '#2C3E50'
    },
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)'
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    colors: {
      primary: '#4ECDC4',
      secondary: '#44A08D',
      accent: '#096DD9',
      text: '#FFFFFF'
    },
    gradient: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)'
  },
  {
    id: 'purple',
    name: 'Purple Rain',
    colors: {
      primary: '#667EEA',
      secondary: '#764BA2',
      accent: '#F093FB',
      text: '#FFFFFF'
    },
    gradient: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)'
  },
  {
    id: 'forest',
    name: 'Forest Green',
    colors: {
      primary: '#11998E',
      secondary: '#38EF7D',
      accent: '#2ECC71',
      text: '#FFFFFF'
    },
    gradient: 'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)'
  },
  {
    id: 'fire',
    name: 'Fire Burst',
    colors: {
      primary: '#FF512F',
      secondary: '#F09819',
      accent: '#FF6B35',
      text: '#FFFFFF'
    },
    gradient: 'linear-gradient(135deg, #FF512F 0%, #F09819 100%)'
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    colors: {
      primary: '#2C3E50',
      secondary: '#3498DB',
      accent: '#9B59B6',
      text: '#FFFFFF'
    },
    gradient: 'linear-gradient(135deg, #2C3E50 0%, #3498DB 100%)'
  }
];

interface ThemeSelectorProps {
  onThemeSelect: (theme: Theme) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onThemeSelect }) => {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme.id);
    onThemeSelect(theme);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {themes.map((theme) => (
        <Card
          key={theme.id}
          className={`relative cursor-pointer transition-all duration-200 hover:scale-105 border-2 ${
            selectedTheme === theme.id
              ? 'border-purple-400 ring-2 ring-purple-400/50'
              : 'border-slate-600 hover:border-slate-500'
          }`}
          onClick={() => handleThemeSelect(theme)}
        >
          <div
            className="h-20 rounded-t-md"
            style={{ background: theme.gradient }}
          />
          <div className="p-3 bg-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">
                {theme.name}
              </span>
              {selectedTheme === theme.id && (
                <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex gap-1 mt-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: theme.colors.secondary }}
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: theme.colors.accent }}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ThemeSelector;
