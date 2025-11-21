// import generalNavigationConfig from "./general.navigation.config.tsx";
// import othersNavigationConfig from "./others.navigation.config.tsx";
// import pagesNavigationConfig from "./pages.navigation.config.tsx";
import type { NavigationTree } from "@/@types/navigation"
import migiosNavigationConfig from "./migios.navigation.tsx"

// import migiosNavigationConfig from './migios';

const navigationConfig: NavigationTree[] = [
  // ...generalNavigationConfig,
  // ...pagesNavigationConfig,
  // ...othersNavigationConfig,
  ...migiosNavigationConfig,
]

export default navigationConfig
