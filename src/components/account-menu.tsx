'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IoPersonCircleOutline } from 'react-icons/io5';

import {
  DropdownMenu,
  DropdownMenuArrow,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSupabase } from '@/libs/supabase/supabase-provider';

import { useToast } from './ui/use-toast';

export function AccountMenu() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();

  async function handleLogoutClick() {
    const { error } = await supabase.auth.signOut();

    router.refresh();

    if (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        description: 'An error occurred while logging out. Please try again or contact support.',
      });
    } else {
      toast({
        description: 'You have been logged out.',
      });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='rounded-full'>
        <IoPersonCircleOutline size={24} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className='me-4'>
        <DropdownMenuItem asChild>
          <Link href='/account'>Account</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogoutClick}>Log Out</DropdownMenuItem>
        <DropdownMenuArrow className='me-4 fill-white' />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
