
'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Wind, User, Loader2 } from 'lucide-react';
import { aiEnvironmentalAssistant } from '@/ai/flows/ai-environmental-assistant';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';

type Inputs = {
  query: string;
};

interface AiAssistantProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function AiAssistant({ isOpen, onOpenChange }: AiAssistantProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!data.query.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: data.query,
    };
    setMessages((prev) => [...prev, userMessage]);
    reset();
    
    try {
      const result = await aiEnvironmentalAssistant({ query: data.query });
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I couldn't process that request. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-md glass !bg-background/95 backdrop-blur-xl border-l">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Wind className="text-primary" />
            AI Environmental Assistant
          </SheetTitle>
          <SheetDescription>
            Ask me about air quality, predictions, or health advice.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 my-4 -mx-6">
          <div className="px-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-start gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback className="bg-primary text-primary-foreground"><Wind size={18} /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'p-3 rounded-lg max-w-sm text-sm whitespace-pre-wrap',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {message.content}
                </div>
                {message.role === 'user' && (
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback><User size={18} /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isSubmitting && (
                <div className="flex items-start gap-3 justify-start">
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback className="bg-primary text-primary-foreground"><Wind size={18} /></AvatarFallback>
                  </Avatar>
                  <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                  </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter>
          <form onSubmit={handleSubmit(onSubmit)} className="w-full flex items-center gap-2">
            <Input
              {...register('query', { required: true })}
              placeholder="e.g., Predict AQI for tomorrow"
              autoComplete="off"
              disabled={isSubmitting}
            />
            <Button type="submit" size="icon" disabled={isSubmitting}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
