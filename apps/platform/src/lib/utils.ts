export const mediaUrl = (
  filename: string | null | undefined,
): string | null => {
  if (!filename) {
    return null;
  }
  return `https://priyobroto-brightpath.s3.ap-south-1.amazonaws.com/${filename}`;
};
