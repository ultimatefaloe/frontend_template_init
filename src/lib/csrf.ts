
export const getCSRFToken = async (): Promise<void> => {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/csrf/`);
};
