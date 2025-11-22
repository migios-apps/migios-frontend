export type AppConfig = {
  apiPrefix: string
  authenticatedEntryPath: string
  clubsAuthenticatedEntryPath: string
  onBoardingEntryPath: string
  unAuthenticatedEntryPath: string
  locale: string
  accessTokenPersistStrategy: "localStorage" | "sessionStorage" | "cookies"
}

const appConfig: AppConfig = {
  apiPrefix: "/api/v1",
  authenticatedEntryPath: "/dashboard",
  clubsAuthenticatedEntryPath: "/clubs",
  onBoardingEntryPath: "/club-setup",
  unAuthenticatedEntryPath: "/sign-in",
  locale: "en",
  accessTokenPersistStrategy: "cookies",
}

export default appConfig
