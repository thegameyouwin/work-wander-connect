 import { useState } from "react";
 import { useTranslation } from "react-i18next";
 import { Globe, Check } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
 import { languages, RTL_LANGUAGES } from "@/i18n";
 
 export const LanguageSwitcher = () => {
   const { i18n } = useTranslation();
   const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];
 
   const handleLanguageChange = (langCode: string) => {
     i18n.changeLanguage(langCode);
     // Update document direction for RTL support
     document.documentElement.dir = RTL_LANGUAGES.includes(langCode) ? "rtl" : "ltr";
     document.documentElement.lang = langCode;
   };
 
   return (
     <DropdownMenu>
       <DropdownMenuTrigger asChild>
         <Button variant="ghost" size="sm" className="gap-2 h-9 px-3">
           <Globe className="w-4 h-4" />
           <span className="hidden sm:inline">{currentLang.flag} {currentLang.nativeName}</span>
           <span className="sm:hidden">{currentLang.flag}</span>
         </Button>
       </DropdownMenuTrigger>
       <DropdownMenuContent align="end" className="min-w-[180px]">
         {languages.map((lang) => (
           <DropdownMenuItem
             key={lang.code}
             onClick={() => handleLanguageChange(lang.code)}
             className="flex items-center justify-between gap-3 cursor-pointer"
           >
             <span className="flex items-center gap-2">
               <span className="text-lg">{lang.flag}</span>
               <span>{lang.nativeName}</span>
             </span>
             {i18n.language === lang.code && (
               <Check className="w-4 h-4 text-primary" />
             )}
           </DropdownMenuItem>
         ))}
       </DropdownMenuContent>
     </DropdownMenu>
   );
 };