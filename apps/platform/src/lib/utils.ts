import { type ReadonlyURLSearchParams } from 'next/navigation';

export const mediaUrl = (
  filename: string | null | undefined,
): string | null => {
  if (!filename) {
    return null;
  }
  return `https://priyobroto-brightpath.s3.ap-south-1.amazonaws.com/${filename}`;
};

export const removeQueryParam = (
  name: string,
  searchParams: ReadonlyURLSearchParams,
): string => {
  const params = new URLSearchParams(searchParams.toString());
  params.delete(name);

  return params.toString();
};

export const addQueryParam = (
  name: string,
  value: string,
  searchParams: ReadonlyURLSearchParams,
): string => {
  const params = new URLSearchParams(searchParams.toString());
  params.set(name, value);

  return params.toString();
};
