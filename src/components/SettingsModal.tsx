import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Palette, 
  Bell, 
  Shield, 
  Keyboard,
  Download,
  Trash2 
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    notifications: boolean;
    soundEffects: boolean;
    autoSave: boolean;
    compactMode: boolean;
    developerMode: boolean;
  };
  onSettingChange: (key: string, value: boolean) => void;
  onExportData: () => void;
  onClearHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingChange,
  onExportData,
  onClearHistory
}) => {
  const settingsSections = [
    {
      title: 'Appearance',
      icon: Palette,
      settings: [
        {
          key: 'compactMode',
          label: 'Compact Mode',
          description: 'Use a more condensed interface layout'
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          key: 'notifications',
          label: 'Push Notifications',
          description: 'Receive notifications for new messages'
        },
        {
          key: 'soundEffects',
          label: 'Sound Effects',
          description: 'Play sounds for interactions'
        }
      ]
    },
    {
      title: 'Privacy & Data',
      icon: Shield,
      settings: [
        {
          key: 'autoSave',
          label: 'Auto-save Conversations',
          description: 'Automatically save chat history'
        }
      ]
    },
    {
      title: 'Advanced',
      icon: Keyboard,
      settings: [
        {
          key: 'developerMode',
          label: 'Developer Mode',
          description: 'Enable advanced debugging features'
        }
      ]
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Settings className="h-5 w-5 text-accent" />
            Settings
          </DialogTitle>
          <DialogDescription className="text-muted">
            Configure your chat experience and preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          {settingsSections.map((section, index) => (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-4">
                <section.icon className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold text-foreground">
                  {section.title}
                </h3>
              </div>
              
              <div className="space-y-4">
                {section.settings.map((setting) => (
                  <div 
                    key={setting.key}
                    className="flex items-center justify-between p-3 rounded-lg bg-glass-bg border border-glass-border"
                  >
                    <div className="flex-1">
                      <Label 
                        htmlFor={setting.key}
                        className="text-sm font-medium text-foreground cursor-pointer"
                      >
                        {setting.label}
                      </Label>
                      <p className="text-xs text-muted mt-1">
                        {setting.description}
                      </p>
                    </div>
                    <Switch
                      id={setting.key}
                      checked={settings[setting.key as keyof typeof settings]}
                      onCheckedChange={(checked) => onSettingChange(setting.key, checked)}
                      className="ml-4"
                    />
                  </div>
                ))}
              </div>
              
              {index < settingsSections.length - 1 && (
                <Separator className="mt-6 bg-glass-border" />
              )}
            </div>
          ))}

          {/* Data Management Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Download className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">
                Data Management
              </h3>
            </div>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={onExportData}
                className="w-full justify-start gap-2 bg-glass-bg border-glass-border hover:bg-input"
              >
                <Download className="h-4 w-4" />
                Export All Data
              </Button>
              
              <Button
                variant="outline"
                onClick={onClearHistory}
                className="w-full justify-start gap-2 bg-glass-bg border-glass-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              >
                <Trash2 className="h-4 w-4" />
                Clear Chat History
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-glass-border">
          <Button 
            onClick={onClose}
            className="bg-accent hover:bg-accent-glow text-black font-medium"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};