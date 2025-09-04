import { useRouter } from 'next/navigation';

type NavigateFunctionType = (routeName: string, options?: { scroll: boolean }) => void;

export const useNavigation = () => {
  const router = useRouter();

  const navigate: NavigateFunctionType = (routeName, options = { scroll: true }) => {
    router.replace(routeName, options);
    router.refresh();
  };

  return navigate;
};
