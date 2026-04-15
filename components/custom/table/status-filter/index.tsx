'use client';

import { result, set as lodashSet, unset } from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { objToQs, qsToObj } from '@/lib/utils';

const StatusFilter = ({
  name = 'filters.status',
  options,
  placeholder,
}: {
  name?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}) => {
  const searchParams = useSearchParams();
  const queryParams = qsToObj(searchParams.toString());
  const router = useRouter();

  const handleSelect = (val: string) => {
    const paramsObj = { ...queryParams };
    if (val !== 'all') {
      lodashSet(paramsObj, name, val);
    } else {
      unset(paramsObj, name);
    }

    if (paramsObj.filters) {
      paramsObj.filters = Object.entries(paramsObj.filters)
        .map(([k, v]) => `${k}=${v}`)
        .join(',');
    }

    // need to reset page
    router.replace(`?${objToQs({ page: 1, ...paramsObj })}`);
  };

  const currentValue = (result(queryParams, name) as string) || 'all';
  const selectedOption = options.find((opt) => opt.value === currentValue);
  const displayText = selectedOption
    ? selectedOption.label
    : placeholder || 'Select...';

  return (
    <div className="flex flex-col gap-2">
      <Select onValueChange={handleSelect} value={currentValue}>
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder={placeholder || 'Select...'}>
            {displayText}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem defaultChecked value="all">
              Бүгд
            </SelectItem>
            {options.map((option) => (
              <SelectItem value={option.value} key={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default StatusFilter;
