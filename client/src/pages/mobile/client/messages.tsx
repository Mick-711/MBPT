import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send } from 'lucide-react';

export default function ClientMessages() {
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['/api/client/messages'],
    staleTime: 1000 * 60, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-lg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const conversations = messagesData?.conversations || [];
  const activeMessages = activeConversation ? 
    (messagesData?.messages?.[activeConversation] || []) : 
    [];
  const activeUser = conversations.find((conv: any) => conv.id === activeConversation);

  const sendMessage = () => {
    if (!messageText.trim()) return;
    
    // Here you would trigger a mutation to send the message
    console.log(`Sending message to ${activeConversation}: ${messageText}`);
    
    // Clear the input
    setMessageText('');
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <div className="flex items-center mb-6">
        {activeConversation ? (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              onClick={() => setActiveConversation(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={activeUser?.avatar} />
                <AvatarFallback>{activeUser?.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <h1 className="text-xl font-bold">{activeUser?.name}</h1>
            </div>
          </>
        ) : (
          <>
            <Link href="/">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Messages</h1>
          </>
        )}
      </div>

      {!activeConversation ? (
        <div>
          {conversations.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <h3 className="text-lg font-medium mb-2">No Messages</h3>
              <p className="text-muted-foreground">
                You don't have any conversations yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation: any) => (
                <Card 
                  key={conversation.id} 
                  className="flex items-center p-4 cursor-pointer"
                  onClick={() => setActiveConversation(conversation.id)}
                >
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={conversation.avatar} />
                    <AvatarFallback>{conversation.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium truncate">{conversation.name}</h3>
                      <span className="text-xs text-muted-foreground ml-2 shrink-0">{conversation.lastTime}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unread > 0 && (
                    <Badge className="ml-2 shrink-0">{conversation.unread}</Badge>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col h-[calc(100vh-120px)]">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {activeMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p>No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              </div>
            ) : (
              activeMessages.map((message: any, index: number) => (
                <div 
                  key={index}
                  className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.fromMe 
                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                        : 'bg-muted rounded-bl-none'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p 
                      className={`text-xs mt-1 ${
                        message.fromMe 
                          ? 'text-primary-foreground/80' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="flex space-x-2">
            <Input 
              className="flex-1" 
              placeholder="Type a message..." 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
            />
            <Button size="icon" onClick={sendMessage} disabled={!messageText.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}