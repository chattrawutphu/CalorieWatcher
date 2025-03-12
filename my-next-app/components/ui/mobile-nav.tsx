"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  PieChart, 
  Plus, 
  Settings, 
  History,
  X,
  Search,
  ChevronRight,
  Pencil,
  Scan,
  Clock,
  Bot,
  Apple,
  Sparkles,
  ArrowLeft,
  Clipboard,
  Camera,
  Bookmark,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Input } from "./input";
import { Button } from "./button";
import { FoodDatabase } from "@/lib/food-database";
import { useNutritionStore, MealEntry, FoodItem } from "@/lib/store/nutrition-store";
import { v4 as uuidv4 } from "uuid";
import { BrowserMultiFormatReader, NotFoundException, ChecksumException, FormatException } from '@zxing/library';
import { getFoodByBarcode, isValidBarcode } from "@/lib/api/barcode-api";
import { useLanguage } from "@/components/providers/language-provider";
import { aiAssistantTranslations } from "@/lib/translations/ai-assistant";

interface NavItem {
  icon: React.ReactNode;
  href: string;
  labelKey: keyof typeof aiAssistantTranslations.en.mobileNav.navigation;
}

const navItems: NavItem[] = [
  {
    icon: <Home className="h-6 w-6" />,
    href: "/home",
    labelKey: "home",
  },
  {
    icon: <PieChart className="h-6 w-6" />,
    href: "/dashboard",
    labelKey: "dashboard",
  },
  {
    icon: <Plus className="h-8 w-8" />,
    href: "#",
    labelKey: "add",
  },
  {
    icon: <History className="h-6 w-6" />,
    href: "/history",
    labelKey: "history",
  },
  {
    icon: <Settings className="h-6 w-6" />,
    href: "/settings",
    labelKey: "settings",
  },
];

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 200
    }
  }
};

const jellyItem = {
  hidden: { scale: 0.8, opacity: 0 },
  show: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      damping: 8,
      stiffness: 100,
      bounce: 0.5
    }
  }
};

const QuickActionButton = ({ icon, label, onClick, description }: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
  description?: string;
}) => (
  <motion.div variants={jellyItem}>
    <motion.div
      whileTap={{ 
        scale: 0.95,
        x: [0, -5, 5, -3, 3, 0],
        transition: { 
          scale: { type: "spring", damping: 5, stiffness: 300 },
          x: { type: "spring", stiffness: 300, damping: 10, duration: 0.5 }
        }
      }}
    >
      <Button
        onClick={onClick}
        variant="outline"
        className="w-full flex items-center gap-4 h-auto p-4 sm:p-4 p-2 text-left font-normal hover:bg-[hsl(var(--accent))/0.1] transition-colors sm:rounded-lg rounded-none sm:border border-0 sm:my-2 my-1"
      >
        <motion.div 
          className="flex-shrink-0 sm:w-12 sm:h-12 w-10 h-10 sm:rounded-2xl rounded-xl bg-[hsl(var(--accent))/0.1] flex items-center justify-center text-[hsl(var(--foreground))]"
          whileTap={{ 
            scale: 0.8,
            rotate: [0, -8, 8, -5, 5, 0],
            transition: { 
              type: "spring",
              damping: 5,
              stiffness: 300,
              rotate: { duration: 0.5 }
            }
          }}
        >
          {icon}
        </motion.div>
        <div className="flex-grow">
          <div className="font-medium sm:text-base text-sm">{label}</div>
          {description && (
            <div className="text-sm sm:text-sm text-xs text-[hsl(var(--muted-foreground))]">{description}</div>
          )}
        </div>
        <ChevronRight className="sm:h-5 sm:w-5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
      </Button>
    </motion.div>
  </motion.div>
);

// Common foods component
const CommonFoods = ({ onSelectFood, onBack }: { onSelectFood: (food: any) => void, onBack: () => void }) => {
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];

  // Group foods by category
  const groupedFoods = FoodDatabase.reduce((acc: Record<string, any[]>, food) => {
    if (!acc[food.category]) {
      acc[food.category] = [];
    }
    acc[food.category].push(food);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={onBack} 
          className="p-1 rounded-full hover:bg-[hsl(var(--muted))] transition-colors mr-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Apple className="h-6 w-6 text-[hsl(var(--primary))]" />
        <h2 className="text-xl font-semibold">{t.mobileNav.commonFoods.title}</h2>
      </div>
      
      {Object.entries(groupedFoods).map(([category, foods]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] capitalize">
            {t.mobileNav.commonFoods.categories[category as keyof typeof t.mobileNav.commonFoods.categories] || category}
          </h3>
          <div className="space-y-2">
            {foods.map((food) => (
              <div 
                key={food.id}
                onClick={() => {
                  // แปลง FoodDatabaseItem เป็น FoodItem ก่อนส่งต่อไปยัง parent component
                  const foodItem: FoodItem = {
                    ...food,
                    favorite: false,
                    createdAt: new Date()
                  };
                  onSelectFood(foodItem);
                }}
                className="p-4 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))/0.1] cursor-pointer transition-colors"
              >
                <div className="font-medium">{food.name}</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  {food.calories} {t.mobileNav.common.calories} {t.mobileNav.common.per} {food.servingSize}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Custom food component
const CustomFood = ({ onAdd, onBack }: { onAdd: (food: FoodItem) => void, onBack: () => void }) => {
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  const [customFood, setCustomFood] = useState<{
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    servingSize: string;
    category: FoodItem['category'];
  }>({
    name: "",
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    servingSize: "1 serving",
    category: "other"
  });

  const handleSubmit = () => {
    if (!customFood.name || !customFood.calories) return;
    
    const newFood: FoodItem = {
      id: crypto.randomUUID(),
      name: customFood.name,
      calories: Number(customFood.calories),
      protein: Number(customFood.protein) || 0,
      carbs: Number(customFood.carbs) || 0,
      fat: Number(customFood.fat) || 0,
      servingSize: customFood.servingSize || "1 serving",
      favorite: false,
      createdAt: new Date(),
      category: customFood.category
    };
    
    onAdd(newFood);
    
    // Reset form
    setCustomFood({
      name: "",
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      servingSize: "1 serving",
      category: "other"
    });
  };

  return (
    <div className="px-4 py-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      
      <h3 className="text-xl font-bold mb-4">{t.addFood.customFood}</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Food Name</label>
          <Input
            value={customFood.name}
            onChange={(e) => setCustomFood({...customFood, name: e.target.value})}
            placeholder="e.g. Homemade Smoothie"
            className="rounded-xl"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Calories</label>
          <Input
            type="number"
            value={customFood.calories}
            onChange={(e) => setCustomFood({...customFood, calories: Number(e.target.value)})}
            placeholder="e.g. 250"
            className="rounded-xl"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Protein (g)</label>
            <Input
              type="number"
              value={customFood.protein}
              onChange={(e) => setCustomFood({...customFood, protein: Number(e.target.value)})}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Carbs (g)</label>
            <Input
              type="number"
              value={customFood.carbs}
              onChange={(e) => setCustomFood({...customFood, carbs: Number(e.target.value)})}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Fat (g)</label>
            <Input
              type="number"
              value={customFood.fat}
              onChange={(e) => setCustomFood({...customFood, fat: Number(e.target.value)})}
              className="rounded-xl"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Serving Size</label>
          <Input
            value={customFood.servingSize}
            onChange={(e) => setCustomFood({...customFood, servingSize: e.target.value})}
            placeholder="e.g. 1 cup, 100g"
            className="rounded-xl"
          />
        </div>
        
        <Button 
          className="w-full mt-4" 
          onClick={handleSubmit}
          disabled={!customFood.name || !customFood.calories}
        >
          {t.addFood.submitButton}
        </Button>
      </div>
    </div>
  );
};

// Barcode scanner component
const BarcodeScanner = ({ onFoodFound, onBack }: { onFoodFound: (food: FoodItem) => void, onBack: () => void }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [cameraPermissionRequested, setCameraPermissionRequested] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  // เตรียม scanner
  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    
    return () => {
      // Cleanup function to stop scanning when component unmounts
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);
  
  // Start/stop scanner based on isScanning state
  useEffect(() => {
    if (!codeReader.current || !videoRef.current) return;
    
    if (isScanning) {
      startScanner();
    } else if (codeReader.current) {
      codeReader.current.reset();
    }
    
    async function startScanner() {
      try {
        const videoElement = videoRef.current;
        if (!videoElement) return;
        
        setCameraPermissionRequested(true);
        
        // Check if user has previously granted camera permissions
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        
        if (cameras.length === 0) {
          throw new Error("No camera found on this device");
        }
        
        // Start scanning with explicit constraints
        await codeReader.current!.decodeFromConstraints(
          {
            video: {
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          },
          videoElement,
          (result, error) => {
            if (result) {
              console.log("Scanned barcode:", result.getText());
              // เมื่อพบบาร์โค้ด ให้หยุดการสแกนและค้นหาข้อมูลอาหาร
              setIsScanning(false);
              lookupBarcodeData(result.getText());
            }
            
            if (error && !(error instanceof NotFoundException)) {
              console.error("Scanner error:", error);
            }
          }
        );
      } catch (err: any) {
        console.error("Failed to start scanner:", err);
        
        // Handle specific error cases with more helpful messages
        if (err.name === 'NotAllowedError') {
          setError("คุณไม่ได้อนุญาตให้เข้าถึงกล้อง กรุณาอนุญาตการเข้าถึงกล้องในการตั้งค่าเบราว์เซอร์");
        } else if (err.name === 'NotFoundError' || err.message.includes('No camera found')) {
          setError("ไม่พบกล้องบนอุปกรณ์นี้ กรุณาใช้อุปกรณ์ที่มีกล้อง");
        } else if (err.name === 'NotReadableError') {
          setError("ไม่สามารถเข้าถึงกล้องได้ อาจเนื่องจากกล้องกำลังถูกใช้งานโดยแอปพลิเคชันอื่น");
        } else {
          setError(`ไม่สามารถเข้าถึงกล้องได้: ${err.message || 'โปรดตรวจสอบการเชื่อมต่อกล้อง'}`);
        }
        
        setIsScanning(false);
      }
    }
  }, [isScanning]);
  
  // Explicitly request camera permission before starting scanner
  const requestCameraPermission = async () => {
    setCameraPermissionRequested(true);
    try {
      // ขอสิทธิ์การเข้าถึงกล้อง
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      // หากได้รับอนุญาต ให้หยุด stream และเริ่มสแกนเนอร์
      stream.getTracks().forEach(track => track.stop());
      
      // เริ่มสแกนเนอร์
      setIsScanning(true);
    } catch (err: any) {
      console.error("Camera permission error:", err);
      
      if (err.name === 'NotAllowedError') {
        setError(t.mobileNav.barcodeScanner.errors.cameraPermission);
      } else if (err.name === 'NotFoundError') {
        setError(t.mobileNav.barcodeScanner.errors.noCamera);
      } else {
        setError(`${t.mobileNav.barcodeScanner.errors.general} ${err.message || ''}`);
      }
    }
  };
  
  // ค้นหาข้อมูลอาหารจากบาร์โค้ด
  const lookupBarcodeData = async (barcode: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // ตรวจสอบว่าบาร์โค้ดถูกต้องหรือไม่
      if (!isValidBarcode(barcode)) {
        setError(t.mobileNav.barcodeScanner.errors.invalidBarcode);
        setIsLoading(false);
        return;
      }
      
      // ค้นหาข้อมูลอาหารจากบาร์โค้ด
      const foodData = await getFoodByBarcode(barcode);
      
      if (foodData) {
        // พบข้อมูลอาหาร ส่งต่อไปยัง parent component
        onFoodFound(foodData);
      } else {
        setError(t.mobileNav.barcodeScanner.errors.notFound);
      }
    } catch (err) {
      console.error("Error looking up barcode:", err);
      setError(t.mobileNav.barcodeScanner.errors.general);
    } finally {
      setIsLoading(false);
      setManualBarcode("");
    }
  };
  
  // ค้นหาบาร์โค้ดที่ป้อนด้วยตนเอง
  const handleManualLookup = async () => {
    if (manualBarcode) {
      await lookupBarcodeData(manualBarcode);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={onBack} 
          className="p-1 rounded-full hover:bg-[hsl(var(--muted))] transition-colors mr-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Scan className="h-6 w-6 text-[hsl(var(--primary))]" />
        <h2 className="text-xl font-semibold">{t.mobileNav.barcodeScanner.title}</h2>
      </div>
      
      {isScanning ? (
        <div className="relative rounded-xl overflow-hidden h-64 bg-black">
          {/* กล้องสำหรับสแกนบาร์โค้ด */}
          <video ref={videoRef} className="w-full h-full object-cover" />
          
          {/* เส้นเป้าหมาย */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-2 border-white/60 rounded-lg w-3/4 h-1/3 flex items-center justify-center">
              <div className="w-full absolute h-0.5 bg-[hsl(var(--primary))]" />
            </div>
          </div>
          
          {/* ปุ่มยกเลิกการสแกน */}
          <Button
            onClick={() => setIsScanning(false)}
            variant="outline"
            className="absolute right-3 top-3 h-10 w-10 p-0 rounded-full bg-white/10 backdrop-blur-md border-white/30"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <div className="bg-black/5 rounded-xl h-64 flex items-center justify-center border-2 border-dashed border-[hsl(var(--border))]">
          {isLoading ? (
            <div className="text-center">
              <Loader2 className="h-10 w-10 mx-auto mb-2 text-[hsl(var(--muted-foreground))] animate-spin" />
              <p className="text-[hsl(var(--muted-foreground))]">{t.mobileNav.barcodeScanner.searching}</p>
            </div>
          ) : (
            <div className="text-center p-4">
              <Camera className="h-10 w-10 mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
              <p className="text-[hsl(var(--muted-foreground))] mb-4">{t.mobileNav.barcodeScanner.scanInstructions}</p>
              <Button
                className="mb-4"
                onClick={requestCameraPermission}
              >
                {t.mobileNav.barcodeScanner.openCamera}
              </Button>
              
              {error && (
                <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-300 flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* ป้อนบาร์โค้ดด้วยตนเอง */}
      <div className="space-y-2">
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
          {t.mobileNav.barcodeScanner.manualInput}
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="8850329112224"
            className="rounded-xl"
          />
          <Button 
            variant="outline" 
            className="flex-shrink-0"
            onClick={handleManualLookup}
            disabled={!manualBarcode || isLoading}
          >
            {t.mobileNav.barcodeScanner.searchButton}
          </Button>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {t.mobileNav.barcodeScanner.testBarcodes}
        </p>
      </div>
    </div>
  );
};

// Recent foods component
const RecentFoods = ({ onSelectFood, onBack }: { onSelectFood: (food: any) => void, onBack: () => void }) => {
  const { dailyLogs, currentDate } = useNutritionStore();
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  // Get all meals from all dates, sorted by most recent
  const allMeals: MealEntry[] = [];
  Object.values(dailyLogs).forEach(log => {
    allMeals.push(...log.meals);
  });
  
  // Sort by date (most recent first) and take the first 10
  const recentMeals = allMeals
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
  
  // Remove duplicates (keep the most recent instance of each food)
  const uniqueFoods: FoodItem[] = [];
  const seenFoodIds = new Set();
  
  recentMeals.forEach(meal => {
    if (!seenFoodIds.has(meal.foodItem.id)) {
      seenFoodIds.add(meal.foodItem.id);
      uniqueFoods.push(meal.foodItem);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={onBack} 
          className="p-1 rounded-full hover:bg-[hsl(var(--muted))] transition-colors mr-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Clock className="h-6 w-6 text-[hsl(var(--primary))]" />
        <h2 className="text-xl font-semibold">{t.mobileNav.recentFoods.title}</h2>
      </div>
      
      {uniqueFoods.length > 0 ? (
        <div className="space-y-2">
          {uniqueFoods.map((food) => (
            <div 
              key={food.id}
              onClick={() => onSelectFood(food)}
              className="p-4 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))/0.1] cursor-pointer transition-colors"
            >
              <div className="font-medium">{food.name}</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                {food.calories} {t.mobileNav.common.calories} {t.mobileNav.common.per} {food.servingSize}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clipboard className="h-10 w-10 mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
          <p className="text-[hsl(var(--muted-foreground))]">{t.mobileNav.recentFoods.noFoods}</p>
        </div>
      )}
    </div>
  );
};

// Food detail component
const FoodDetail = ({ 
  food, 
  onBack,
  onAddFood 
}: { 
  food: FoodItem, 
  onBack: () => void,
  onAddFood: (food: FoodItem, quantity: number, mealType: string) => void 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState("breakfast");
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        className="flex items-center gap-2 p-0 h-auto mb-2"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t.mobileNav.foodDetail.back}</span>
      </Button>
      
      <div>
        <h2 className="text-xl font-semibold">{food.name}</h2>
        <p className="text-[hsl(var(--muted-foreground))]">
          {food.servingSize} • {food.calories} kcal
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-4 pb-2">
        <div className="p-3 rounded-xl bg-[hsl(var(--accent))/0.1]">
          <div className="text-xs text-[hsl(var(--primary))]">{t.result.protein}</div>
          <div className="text-lg font-semibold">{food.protein}g</div>
        </div>
        <div className="p-3 rounded-xl bg-[hsl(var(--accent))/0.1]">
          <div className="text-xs text-[hsl(var(--primary))]">{t.result.carbs}</div>
          <div className="text-lg font-semibold">{food.carbs}g</div>
        </div>
        <div className="p-3 rounded-xl bg-[hsl(var(--accent))/0.1]">
          <div className="text-xs text-[hsl(var(--primary))]">{t.result.fat}</div>
          <div className="text-lg font-semibold">{food.fat}g</div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t.mobileNav.foodDetail.mealType}</label>
          <select 
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="w-full rounded-xl border border-[hsl(var(--border))] p-3 bg-transparent"
          >
            <option value="breakfast">{t.mobileNav.foodDetail.mealTypes.breakfast}</option>
            <option value="lunch">{t.mobileNav.foodDetail.mealTypes.lunch}</option>
            <option value="dinner">{t.mobileNav.foodDetail.mealTypes.dinner}</option>
            <option value="snack">{t.mobileNav.foodDetail.mealTypes.snack}</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">{t.mobileNav.foodDetail.quantity}</label>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-l-xl border-r-0"
              onClick={() => quantity > 1 && setQuantity(quantity - 1)}
            >
              -
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="h-10 rounded-none text-center border-x-0"
              min="1"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-r-xl border-l-0"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </Button>
          </div>
        </div>
        
        <div className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          {t.mobileNav.foodDetail.totalCalories}: {food.calories * quantity} kcal
        </div>
      </div>
      
      <Button 
        className="w-full" 
        onClick={() => onAddFood(food, quantity, mealType)}
      >
        {t.mobileNav.foodDetail.addToMealButton}
      </Button>
    </div>
  );
};

const BottomSheet = ({ isOpen, onClose, onMealAdded }: { isOpen: boolean; onClose: () => void; onMealAdded: (food: FoodItem) => void }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { addMeal } = useNutritionStore();
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  // State to manage different sections
  const [currentSection, setCurrentSection] = useState<
    "main" | "common" | "custom" | "barcode" | "recent" | "detail"
  >("main");
  
  // State for selected food
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // Effect to prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Add the no-scroll class to the document body
      document.body.classList.add('overflow-hidden');
      
      // Add a style tag to hide all scrollbars
      const styleElement = document.createElement('style');
      styleElement.id = 'hide-scrollbars-style';
      styleElement.textContent = `
        ::-webkit-scrollbar {
          display: none !important;
        }
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `;
      document.head.appendChild(styleElement);
    } else {
      // Remove the no-scroll class when modal is closed
      document.body.classList.remove('overflow-hidden');
      
      // Remove the style tag
      const styleElement = document.getElementById('hide-scrollbars-style');
      if (styleElement) {
        styleElement.remove();
      }
    }
    
    // Cleanup on component unmount
    return () => {
      document.body.classList.remove('overflow-hidden');
      const styleElement = document.getElementById('hide-scrollbars-style');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [isOpen]);

  // Handle adding a food to the log
  const handleAddFood = (food: FoodItem, quantity: number, mealType: string) => {
    const meal: MealEntry = {
      id: crypto.randomUUID(),
      mealType: mealType as "breakfast" | "lunch" | "dinner" | "snack",
      foodItem: food,
      quantity: quantity,
      date: new Date().toISOString().split('T')[0],
    };
    
    addMeal(meal);
    
    // Return to main view
    setCurrentSection("main");
  };
  
  // Reset view when modal closes
  const handleClose = () => {
    setCurrentSection("main");
    setSelectedFood(null);
    onClose();
  };

  // Filter food items based on search term
  const filteredFoodItems = searchQuery
    ? FoodDatabase.filter((food) =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          
          {/* Main Sheet Container */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ 
              y: 0,
              transition: { 
                type: "spring", 
                damping: 25,
                stiffness: 300,
                mass: 0.5
              } 
            }}
            exit={{ 
              y: "100%", 
              transition: { 
                type: "spring", 
                damping: 20, 
                stiffness: 300
              } 
            }}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-[hsl(var(--background))] rounded-t-xl max-h-[90vh] overflow-hidden scrollbar-hide"
          >
            {/* Header */}
            <div>
              {/* Drag Handle */}
              <div className="pt-2 pb-1 flex justify-center items-center">
                <div className="w-12 h-1.5 rounded-full bg-[hsl(var(--muted))]" />
              </div>

              {/* Header with Title, Description and Close Button */}
              <div className="px-6 py-3 flex justify-between">
                {/* Title and Description */}
                <div className="flex-1 pr-2">
                  {currentSection === "main" ? (
                    <>
                      <h2 className="text-xl font-bold">{t.addFood.title}</h2>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.addFood.subtitle}</p>
                    </>
                  ) : (
                    <>
                      {currentSection === "common" && <h2 className="text-xl font-bold">{t.mobileNav.commonFoods.title}</h2>}
                      {currentSection === "custom" && <h2 className="text-xl font-bold">{t.addFood.customFood}</h2>}
                      {currentSection === "barcode" && <h2 className="text-xl font-bold">{t.mobileNav.barcodeScanner.title}</h2>}
                      {currentSection === "recent" && <h2 className="text-xl font-bold">{t.mobileNav.recentFoods.title}</h2>}
                      {currentSection === "detail" && <h2 className="text-xl font-bold">{selectedFood?.name}</h2>}
                    </>
                  )}
                </div>
                
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-[hsl(var(--muted))/0.15] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))/0.3] hover:text-[hsl(var(--foreground))] transition-all"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="sm:px-6 px-3 py-4 max-w-md mx-auto pb-36">
                {currentSection === "main" && (
                  <motion.div variants={container} initial="hidden" animate="show">
                    {/* Search Bar */}
                    <motion.div variants={item} className="relative sm:mb-6 mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                      <Input
                        type="text"
                        placeholder={t.mobileNav.common.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 pr-4 sm:h-14 h-12 sm:text-lg text-base rounded-2xl border-2 focus-visible:ring-offset-0 focus-visible:ring-1"
                      />
                    </motion.div>

                    {/* AI Assistant Button */}
                    <motion.div variants={jellyItem}>
                      <motion.div
                        whileHover={{ 
                          scale: 1.03,
                          transition: { type: "spring", damping: 8, stiffness: 300 }
                        }}
                        whileTap={{ 
                          scale: 0.97,
                          transition: { type: "spring", damping: 10, stiffness: 300 }
                        }}
                      >
                        <Button
                          onClick={() => {
                            // Keep this as a page navigation for now
                            router.push("/add/ai");
                            onClose();
                          }}
                          className="w-full h-auto sm:p-4 p-3 sm:mb-6 mb-4 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:opacity-90 transition-opacity sm:rounded-xl rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <motion.div 
                              className="sm:w-12 sm:h-12 w-10 h-10 sm:rounded-2xl rounded-xl bg-white/20 flex items-center justify-center"
                              animate={{ 
                                rotate: [0, 0, -5, 5, -3, 3, 0],
                                scale: [1, 1, 1.1, 1.1, 1.05, 1.05, 1]
                              }}
                              transition={{ 
                                repeat: Infinity, 
                                repeatDelay: 3,
                                duration: 1.5,
                                ease: "easeInOut"
                              }}
                            >
                              <Bot className="sm:h-6 sm:w-6 h-5 w-5" />
                            </motion.div>
                            <div className="flex-grow text-left">
                              <div className="font-medium sm:text-base text-sm">{t.mobileNav.aiAssistant.title}</div>
                              <div className="sm:text-sm text-xs opacity-90">{t.mobileNav.aiAssistant.description}</div>
                            </div>
                            <motion.div
                              animate={{ 
                                rotate: [0, 10, -10, 10, 0],
                                scale: [1, 1.2, 1.2, 1.2, 1]
                              }}
                              transition={{ 
                                repeat: Infinity, 
                                repeatDelay: 2,
                                duration: 1,
                                ease: "easeInOut"
                              }}
                            >
                              <Sparkles className="sm:h-5 sm:w-5 h-4 w-4" />
                            </motion.div>
                          </div>
                        </Button>
                      </motion.div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div variants={item} className="space-y-3">
                      <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] sm:mb-3 mb-2">
                        {t.mobileNav.common.quickActions}
                      </h3>
                      
                      <QuickActionButton
                        icon={<Apple className="h-6 w-6" />}
                        label={t.mobileNav.commonFoods.title}
                        description={t.mobileNav.common.commonFoodsDesc}
                        onClick={() => setCurrentSection("common")}
                      />

                      <QuickActionButton
                        icon={<Pencil className="h-6 w-6" />}
                        label={t.addFood.customFood}
                        description={t.mobileNav.common.customFoodDesc}
                        onClick={() => setCurrentSection("custom")}
                      />

                      <QuickActionButton
                        icon={<Scan className="h-6 w-6" />}
                        label={t.mobileNav.barcodeScanner.title}
                        description={t.mobileNav.common.barcodeScannerDesc}
                        onClick={() => setCurrentSection("barcode")}
                      />

                      <QuickActionButton
                        icon={<Clock className="h-6 w-6" />}
                        label={t.mobileNav.recentFoods.title}
                        description={t.mobileNav.common.recentFoodsDesc}
                        onClick={() => setCurrentSection("recent")}
                      />
                    </motion.div>

                    {/* Search Results */}
                    {searchQuery.length > 0 && (
                      <motion.div variants={item} className="mt-6 space-y-2">
                        <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-3">
                          Search Results
                        </h3>
                        
                        {filteredFoodItems.length > 0 ? (
                          <div className="divide-y divide-[hsl(var(--border))]">
                            {filteredFoodItems.slice(0, 10).map((food) => (
                              <div
                                key={food.id}
                                onClick={() => {
                                  // แปลง FoodDatabaseItem เป็น FoodItem ก่อนกำหนดให้ selectedFood
                                  const foodItem: FoodItem = {
                                    ...food,
                                    favorite: false,
                                    createdAt: new Date()
                                  };
                                  setSelectedFood(foodItem);
                                  setCurrentSection("detail");
                                }}
                                className="py-3 flex items-center justify-between cursor-pointer hover:bg-[hsl(var(--muted))] -mx-2 px-2 rounded-lg transition-colors"
                              >
                                <div>
                                  <div className="font-medium">{food.name}</div>
                                  <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                    {food.calories} {t.mobileNav.common.calories} {t.mobileNav.common.per} {food.servingSize}
                                  </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[hsl(var(--muted-foreground))] italic">
                            No food items found matching "{searchQuery}"
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                )}
                
                {currentSection === "common" && (
                  <CommonFoods 
                    onSelectFood={(food) => {
                      setSelectedFood(food);
                      setCurrentSection("detail");
                    }} 
                    onBack={() => setCurrentSection("main")}
                  />
                )}
                
                {currentSection === "custom" && (
                  <CustomFood 
                    onAdd={(food) => {
                      setSelectedFood(food);
                      setCurrentSection("detail");
                    }} 
                    onBack={() => setCurrentSection("main")}
                  />
                )}
                
                {currentSection === "barcode" && (
                  <BarcodeScanner 
                    onFoodFound={(food) => {
                      setSelectedFood(food);
                      setCurrentSection("detail");
                    }} 
                    onBack={() => setCurrentSection("main")}
                  />
                )}
                
                {currentSection === "recent" && (
                  <RecentFoods 
                    onSelectFood={(food) => {
                      setSelectedFood(food);
                      setCurrentSection("detail");
                    }} 
                    onBack={() => setCurrentSection("main")}
                  />
                )}
                
                {currentSection === "detail" && selectedFood && (
                  <FoodDetail 
                    food={selectedFood} 
                    onBack={() => {
                      setSelectedFood(null);
                      setCurrentSection("main");
                    }}
                    onAddFood={handleAddFood}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { locale } = useLanguage();
  const t = aiAssistantTranslations[locale];
  
  // State to track which button is currently animating
  const [animatingButton, setAnimatingButton] = useState<string | null>(null);
  
  // Handle button click with animation
  const handleButtonClick = (href: string) => {
    // Set this button as animating but still navigate immediately
    setAnimatingButton(href);
    
    // Reset animation state after animation completes (animation will continue in background)
    setTimeout(() => {
      setAnimatingButton(null);
    }, 400);
    
    // Handle menu actions immediately
    if (href === "#") {
      setIsAddOpen(true);
    } else {
      // Navigate to the page immediately
      router.push(href);
      
      // Close the Add Food Popup if it's open
      if (isAddOpen) {
        setIsAddOpen(false);
      }
    }
  };
  
  return (
    <>
      <BottomSheet 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onMealAdded={(food) => {
          // Handle meal added if needed
          setIsAddOpen(false);
        }} 
      />
      
      <nav className="fixed bottom-0 left-0 z-50 w-full">
        <div className="mx-auto sm:px-6 px-2">
          <div
            className="flex pb-6 pt-1 items-center justify-around bg-[hsl(var(--background))] bg-opacity-50 backdrop-blur-md sm:rounded-t-xl rounded-t-lg sm:border border-b-0 border-x-0 sm:border-x sm:border-t border-[hsl(var(--border))] shadow-lg max-w-md mx-auto"
          >
            {navItems.map((item) => (
              <div
                key={item.href}
                className="flex-1 flex items-stretch justify-center"
              >
                {item.href === "#" ? (
                  <div
                    onClick={() => handleButtonClick(item.href)}
                    className="flex-1 flex flex-col items-center justify-center cursor-pointer py-1 max-w-[80px]"
                  >
                    <div className="sm:-mt-6 -mt-5">
                      <motion.div 
                        animate={animatingButton === item.href ? {
                          scale: [1, 1.5, 0.8, 1.2, 1],
                          transition: { times: [0, 0.2, 0.5, 0.8, 1], duration: 0.4 }
                        } : {}}
                        className="flex items-center justify-center sm:h-16 sm:w-16 h-14 w-14 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-lg"
                      >
                        {item.icon}
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex justify-center">
                    <button
                      onClick={() => handleButtonClick(item.href)}
                      className="flex flex-col items-center w-full h-full px-1 py-1 cursor-pointer max-w-[60px]"
                    >
                      <div className="flex flex-col items-center">
                        <motion.div
                          animate={animatingButton === item.href ? {
                            scale: [1, 1.5, 0.8, 1.2, 1],
                            transition: { times: [0, 0.2, 0.5, 0.8, 1], duration: 0.4 }
                          } : {}}
                          className={cn(
                            "flex items-center justify-center sm:h-10 sm:w-10 h-8 w-8 rounded-full",
                            pathname === item.href
                              ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                          )}
                        >
                          {item.icon}
                        </motion.div>
                        <span 
                          className={cn(
                            "mt-1 sm:text-xs text-[10px] truncate w-full text-center",
                            pathname === item.href
                              ? "text-[hsl(var(--foreground))] font-medium"
                              : "text-[hsl(var(--muted-foreground))]"
                          )}
                        >
                          {t.mobileNav.navigation[item.labelKey]}
                        </span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
} 