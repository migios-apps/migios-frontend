import type { ElementType, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { PageLoader } from "./page-loader"
import { Spinner } from "./spinner"

type CommonProps = {
  className?: string
  children?: ReactNode
}

interface BaseLoadingProps extends CommonProps {
  asElement?: ElementType
  customLoader?: ReactNode
  loading: boolean
  spinnerClass?: string
}

interface LoadingProps extends BaseLoadingProps {
  type?: "default" | "cover"
}

const DefaultLoading = (props: BaseLoadingProps) => {
  const {
    loading,
    children,
    className,
    asElement: Component = "div",
    customLoader,
  } = props

  return loading ? (
    <Component
      className={cn(
        !customLoader && "flex h-full items-center justify-center",
        className
      )}
    >
      {customLoader ? <>{customLoader}</> : <PageLoader />}
    </Component>
  ) : (
    <>{children}</>
  )
}

const CoveredLoading = (props: BaseLoadingProps) => {
  const {
    loading,
    children,
    spinnerClass,
    className,
    asElement: Component = "div",
    customLoader,
  } = props

  return (
    <Component className={cn(loading ? "relative" : "", className)}>
      {children}
      {loading && (
        <div className="dark:bg-opacity-60 bg-opacity-50 absolute inset-0 h-full w-full bg-white dark:bg-gray-800" />
      )}
      {loading && (
        <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform">
          {customLoader ? (
            <>{customLoader}</>
          ) : (
            <Spinner className={cn("size-6", spinnerClass)} />
          )}
        </div>
      )}
    </Component>
  )
}

const Loading = ({
  type = "default",
  loading = false,
  asElement = "div",
  ...rest
}: LoadingProps) => {
  switch (type) {
    case "default":
      return (
        <DefaultLoading loading={loading} asElement={asElement} {...rest} />
      )
    case "cover":
      return (
        <CoveredLoading loading={loading} asElement={asElement} {...rest} />
      )
    default:
      return (
        <DefaultLoading loading={loading} asElement={asElement} {...rest} />
      )
  }
}

export default Loading
