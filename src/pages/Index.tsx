
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Download, Wand2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import ThemeSelector from "../components/ThemeSelector";
import PosterPreview from "../components/PosterPreview";
import { generatePromoContent } from "../services/aiService";

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

const Index = () => {
  const [business_type, setBusiness_type] = useState('');
  const [promo_text, setPromo_text] = useState('');
  const [theme, setTheme] = useState<Theme | null>(null);
  const [promo_line, setPromo_line] = useState('');
  const [poster_image, setPoster_image] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const handleGenerate = async () => {
    if (!business_type.trim() || !promo_text.trim() || !theme) {
      toast.error("Please fill in all fields and select a theme");
      return;
    }

    if (!apiKey.trim()) {
      toast.error("Please enter your OpenAI API key");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generatePromoContent(business_type, promo_text, theme.name, apiKey);
      setPromo_line(result.text);
      setPoster_image(result.imageUrl);
      toast.success("Poster generated successfully!");
    } catch (error) {
      console.error('Generation error:', error);
      toast.error("Failed to generate poster. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!promo_line || !poster_image) {
      toast.error("Please generate a poster first");
      return;
    }
    
    const event = new CustomEvent('downloadPoster');
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Postify
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Create stunning AI-powered promotional posters for your business in seconds
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Input Form */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Create Your Poster
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* API Key Input */}
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-slate-300">
                    OpenAI API Key
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your OpenAI API key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                  />
                  <p className="text-xs text-slate-400">
                    Your API key is stored locally and never shared
                  </p>
                </div>

                {/* Business Type */}
                <div className="space-y-2">
                  <Label htmlFor="business_type" className="text-slate-300">
                    Business Type
                  </Label>
                  <Input
                    id="business_type"
                    placeholder="e.g., Restaurant, Gym, Salon, Tech Startup..."
                    value={business_type}
                    onChange={(e) => setBusiness_type(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>

                {/* Promo Text */}
                <div className="space-y-2">
                  <Label htmlFor="promo_text" className="text-slate-300">
                    Promo Text
                  </Label>
                  <Textarea
                    id="promo_text"
                    placeholder="e.g., 50% off first month, Buy 1 Get 1 Free, Free consultation..."
                    value={promo_text}
                    onChange={(e) => setPromo_text(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 min-h-[100px]"
                  />
                </div>

                {/* Theme Selection */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Choose Theme</Label>
                  <ThemeSelector onThemeSelect={setTheme} />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Magic...
                    </>
                  ) : (
                    <>
                      🔥 Generate Poster
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Poster Preview */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Your Poster Preview</span>
                  {promo_line && poster_image && (
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PosterPreview
                  business_type={business_type}
                  promo_text={promo_text}
                  theme={theme}
                  promo_line={promo_line}
                  poster_image={poster_image}
                  isGenerating={isGenerating}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
