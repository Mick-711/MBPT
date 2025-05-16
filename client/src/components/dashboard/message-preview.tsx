import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";

interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'read';
  readAt?: string;
}

interface Conversation {
  user: {
    id: number;
    username: string;
    fullName: string;
    profileImage?: string;
    online?: boolean;
  };
  lastMessage: Message;
  unreadCount: number;
}

interface MessageItemProps {
  conversation: Conversation;
}

const MessageItem = ({ conversation }: MessageItemProps) => {
  // Format time display
  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else if (diffMinutes < 24 * 60) {
      return `${Math.floor(diffMinutes / 60)}h`;
    } else {
      return format(messageDate, 'MMM d');
    }
  };

  return (
    <div className="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
      <div className="relative flex-shrink-0">
        {conversation.user.profileImage ? (
          <img 
            src={conversation.user.profileImage} 
            alt={conversation.user.fullName} 
            className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" 
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium">
            {conversation.user.fullName.split(" ").map(n => n[0]).join("")}
          </div>
        )}
        <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-900 ${
          conversation.user.online ? 'bg-secondary-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}></span>
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {conversation.user.fullName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatMessageTime(conversation.lastMessage.sentAt)}
          </p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
          {conversation.lastMessage.content}
        </p>
      </div>
    </div>
  );
};

export default function MessagePreview() {
  // Fetch conversations
  const { data: conversations, isLoading, error } = useQuery({
    queryKey: ['/api/messages'],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(queryKey[0], {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return response.json();
    },
  });

  // Default conversations for initial implementation
  const defaultConversations: Conversation[] = [
    {
      user: {
        id: 1,
        username: 'sarahj',
        fullName: 'Sarah Johnson',
        online: true
      },
      lastMessage: {
        id: 1,
        senderId: 1,
        recipientId: 0, // Logged in user
        content: "I've been following the meal plan and I'm already feeling more energetic!",
        sentAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
        status: 'delivered'
      },
      unreadCount: 1
    },
    {
      user: {
        id: 2,
        username: 'miket',
        fullName: 'Michael Thompson',
        online: false
      },
      lastMessage: {
        id: 2,
        senderId: 2,
        recipientId: 0, // Logged in user
        content: "Question about the protein intake for the bulking plan...",
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        status: 'delivered'
      },
      unreadCount: 1
    },
    {
      user: {
        id: 3,
        username: 'emmaw',
        fullName: 'Emma Williams',
        online: false
      },
      lastMessage: {
        id: 3,
        senderId: 3,
        recipientId: 0, // Logged in user
        content: "I've sent the progress photos. Let me know what you think!",
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        status: 'read',
        readAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
      },
      unreadCount: 0
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-gray-100">
            Recent Messages
          </h2>
          <Link href="/messages">
            <Button variant="link" className="text-sm text-primary-600 p-0 h-auto font-medium">
              <MessageSquare size={16} className="mr-1" />
              View All
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
              ))}
            </>
          ) : error ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p>Failed to load messages</p>
              <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </div>
          ) : (
            <>
              {(conversations?.length > 0 ? conversations : defaultConversations).map((conversation) => (
                <Link 
                  key={conversation.user.id} 
                  href={`/messages/${conversation.user.id}`}
                  className="block"
                >
                  <MessageItem conversation={conversation} />
                </Link>
              ))}
            </>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Link href="/messages/new">
            <Button variant="outline" className="w-full">
              <MessageSquare size={16} className="mr-2" />
              Send New Message
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
