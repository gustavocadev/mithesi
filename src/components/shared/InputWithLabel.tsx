import { component$ } from '@builder.io/qwik';
import { Label } from '../ui/label/label';
import { Input } from '../ui/input/input';

export const InputWithLabel = component$(() => {
  return (
    <div class="grid w-full max-w-sm items-center gap-1.5">
      <Label for="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  );
});
