'use client';

import { partition } from 'lodash';
import { useRouter } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, imageResize } from '@/lib/utils';
import { ContentPlanResponseType } from '@/services/schema';

type Props = {
  defaultValue?: string | null;
  options: ContentPlanResponseType[];
};

export function PlanSelectFilter({ defaultValue, options = [] }: Props) {
  const router = useRouter();
  const [customPlans, tieredPlans] = partition(
    options,
    (c) => c.type === 'custom',
  );

  return (
    <Select
      defaultValue={defaultValue ?? 'all'}
      onValueChange={(c) => {
        router.replace(c !== 'all' ? `?plan_id=${c}` : '/subscriptions');
      }}
    >
      <SelectTrigger className="w-[260px] text-left!">
        <SelectValue placeholder="Select plan" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="all" className="py-1">
          Бүх багц
        </SelectItem>
        <SelectSeparator />
        <PlanGroup options={customPlans} label="Захиалгат" />
        <SelectSeparator />
        <PlanGroup options={tieredPlans} label="Зэрэглэлтэй" />
      </SelectContent>
    </Select>
  );
}

function PlanGroup({
  options,
  label,
}: {
  options: ContentPlanResponseType[];
  label?: string;
}) {
  return (
    <SelectGroup>
      {label && (
        <SelectLabel className="text-muted-foreground text-xs">
          {label}
        </SelectLabel>
      )}
      {options.map((plan) => {
        return (
          <SelectItem key={plan.id} value={plan.id}>
            <div className="flex items-center gap-2">
              {plan.image_url ? (
                <img
                  src={imageResize(plan.image_url, 'tiny')}
                  className="size-7 rounded-md object-cover"
                />
              ) : (
                <div className="bg-muted flex size-7 items-center justify-center rounded-md">
                  -
                </div>
              )}

              <div className="flex flex-col">
                <span className="text-sm leading-none font-medium">
                  {plan.name}
                </span>

                <span
                  className={cn('text-xs', {
                    'text-green-600': plan.is_active,
                    'text-muted-foreground': !plan.is_active,
                  })}
                >
                  {plan.is_active ? 'active' : 'inactive'}
                </span>
              </div>
            </div>
          </SelectItem>
        );
      })}
    </SelectGroup>
  );
}
