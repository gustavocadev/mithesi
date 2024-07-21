import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { Button } from '../ui/button/button';
import { LuHome, LuSearch, LuUser } from '@qwikest/icons/lucide';
import { useUserAuth } from '~/routes/(authed)/layout';

export const MobileMenu = component$(() => {
  const user = useUserAuth();
  return (
    <nav class="gap-2 fixed bottom-0 flex xl:hidden items-center justify-center w-full bg-white p-1 z-50">
      <Link href="/projects" class="block">
        <Button look="ghost" class="py-7">
          <LuHome class="size-6" />
        </Button>
      </Link>
      <Link href="/projects/search" class="block">
        <Button look="ghost" class="py-7">
          <LuSearch class="size-6" />
        </Button>
      </Link>
      <Link href={`/${user.value.username}`} class="block">
        <Button look="ghost" class="py-7">
          <LuUser class="size-6" />
        </Button>
      </Link>
    </nav>
  );
});
