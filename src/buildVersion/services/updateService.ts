export interface UpdateService {
  checkForUpdates: () => Promise<boolean>
  getLatestBuildVersion: () => Promise<string>
  markVersionAsRefreshed: (version: string) => void
}

class UpdateServiceImpl implements UpdateService {
  private currentEnvironment: string
  private readonly CURRENT_VERSION_KEY = "currentVersion"

  constructor() {
    this.currentEnvironment = import.meta.env.MODE || "development"

    console.log("UpdateService initialized:", {
      environment: this.currentEnvironment,
    })
  }

  private getDismissedVersion(): string {
    return localStorage.getItem(this.CURRENT_VERSION_KEY) || ""
  }

  private setDismissedVersion(version: string): void {
    localStorage.setItem(this.CURRENT_VERSION_KEY, version)
  }

  async getLatestBuildVersion(): Promise<string> {
    if (import.meta.env.MODE === "development") {
      return ""
    }

    try {
      // Fetch the latest build version from the server
      const response = await fetch("/assets/buildVersion.json?" + Date.now())
      const data = await response.json()
      return data[this.currentEnvironment] || ""
    } catch (error) {
      console.warn(`Build version file not found. Skipping update check.`)
      return ""
    }
  }

  async checkForUpdates(): Promise<boolean> {
    try {
      const dismissedVersion = this.getDismissedVersion()
      const latestVersion = await this.getLatestBuildVersion()

      // Jika first load (belum ada version di localStorage), simpan latest sebagai current
      if (dismissedVersion === "") {
        if (latestVersion !== "") {
          this.setDismissedVersion(latestVersion)
          console.log("First load - saved current version:", latestVersion)
        }
        return false
      }

      const hasUpdate =
        latestVersion !== "" && latestVersion !== dismissedVersion

      if (hasUpdate) {
        console.log("Update available:", {
          latest: latestVersion,
          current: dismissedVersion,
        })
      } else {
        console.log("No update needed - version already dismissed or empty")
      }

      return hasUpdate
    } catch (error) {
      console.error("Error checking for updates:", error)
      return false
    }
  }

  markVersionAsRefreshed(version: string): void {
    console.log("Marking version as refreshed:", version)
    this.setDismissedVersion(version)
    console.log(
      "Version saved to localStorage:",
      localStorage.getItem(this.CURRENT_VERSION_KEY)
    )
  }
}

export const updateService = new UpdateServiceImpl()
export default updateService
