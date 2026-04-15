// components/table/SearchInput.tsx
'use client';

import { ChangeEvent, useState } from 'react';
import { debounce } from 'lodash';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { qsToObj } from '@/lib/utils';

interface SearchInputProps {
  filterField: string; // e.g., "discount_name", "product_name"
  paramKey?: string; // default: "filters"
  placeholder?: string;
}

export function SearchInput({
  filterField,
  paramKey = 'filters',
  placeholder = 'Search...',
}: SearchInputProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const paramsObj = qsToObj(searchParams.toString());

  const [value, setValue] = useState(paramsObj.filters?.title ?? '');

  // Debounced update
  const updateParams = debounce((val: string) => {
    const newParams = new URLSearchParams(searchParams.toString());

    // Remove previous value
    newParams.delete(paramKey);

    if (val) {
      newParams.set(paramKey, `${filterField}=${val}`);
      newParams.set('page', '1');
    }

    router.push(`${pathname}?${newParams.toString()}`);
  }, 1000);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    updateParams(val);
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-[300px]"
    />
  );
}
