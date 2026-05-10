/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface User {
  uid?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  currency?: string;
  onboardingCompleted?: boolean;
  /** @format date-time */
  createdAt?: string;
}

export interface Category {
  id?: number;
  name?: string;
  type?: "expense" | "income";
  icon?: string;
  userId?: string;
  isDefault?: boolean;
}

export interface Account {
  id?: number;
  name?: string;
  type?: "wallet" | "card" | "bank";
  initialBalance?: number;
  currentBalance?: number;
  userId?: string;
  color?: string;
  icon?: string;
  currency?: string;
}

export interface Transaction {
  id?: number;
  amount?: number;
  type?: "expense" | "income";
  categoryId?: number;
  accountId?: number;
  /** @format date-time */
  date?: string;
  description?: string;
  currency?: string;
  userId?: string;
}

export interface DashboardData {
  netWorth?: number;
  currencyTotals?: {
    currency?: string;
    amount?: number;
  }[];
  monthlyStats?: {
    name?: string;
    income?: number;
    expense?: number;
  }[];
  categorySpending?: {
    name?: string;
    value?: number;
  }[];
  dailyTrend?: {
    date?: string;
    amount?: number;
  }[];
  accountSummaries?: {
    id?: string;
    name?: string;
    type?: string;
    balance?: number;
    color?: string;
  }[];
}

export interface Error {
  error?: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "http://localhost:8080";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Splitify API
 * @version 1.0.0
 * @baseUrl http://localhost:8080
 *
 * API for Splitify expense management application
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  health = {
    /**
     * No description
     *
     * @name HealthList
     * @summary Health check
     * @request GET:/health
     */
    healthList: (params: RequestParams = {}) =>
      this.request<
        {
          status?: string;
        },
        any
      >({
        path: `/health`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  api = {
    /**
     * No description
     *
     * @name GetApi
     * @summary Get current user UID
     * @request GET:/api/me
     * @secure
     */
    getApi: (params: RequestParams = {}) =>
      this.request<
        {
          uid?: string;
        },
        any
      >({
        path: `/api/me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name ProfileSyncCreate
     * @summary Sync user profile with Firebase token
     * @request POST:/api/profile/sync
     * @secure
     */
    profileSyncCreate: (params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/api/profile/sync`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name ProfileList
     * @summary Get user profile
     * @request GET:/api/profile
     * @secure
     */
    profileList: (params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/api/profile`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name ProfileUpdate
     * @summary Update user profile
     * @request PUT:/api/profile
     * @secure
     */
    profileUpdate: (data: User, params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/api/profile`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name ProfilePurgeCreate
     * @summary Purge all user data
     * @request POST:/api/profile/purge
     * @secure
     */
    profilePurgeCreate: (params: RequestParams = {}) =>
      this.request<
        {
          message?: string;
        },
        any
      >({
        path: `/api/profile/purge`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name DashboardList
     * @summary Get dashboard data
     * @request GET:/api/dashboard
     * @secure
     */
    dashboardList: (params: RequestParams = {}) =>
      this.request<DashboardData, any>({
        path: `/api/dashboard`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CategoriesList
     * @summary List categories
     * @request GET:/api/categories
     * @secure
     */
    categoriesList: (params: RequestParams = {}) =>
      this.request<Category[], any>({
        path: `/api/categories`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CategoriesCreate
     * @summary Create category
     * @request POST:/api/categories
     * @secure
     */
    categoriesCreate: (data: Category, params: RequestParams = {}) =>
      this.request<Category, any>({
        path: `/api/categories`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CategoriesUpdate
     * @summary Update category
     * @request PUT:/api/categories/{id}
     * @secure
     */
    categoriesUpdate: (
      id: string,
      data: Category,
      params: RequestParams = {},
    ) =>
      this.request<Category, any>({
        path: `/api/categories/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CategoriesDelete
     * @summary Delete category
     * @request DELETE:/api/categories/{id}
     * @secure
     */
    categoriesDelete: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          message?: string;
        },
        Error
      >({
        path: `/api/categories/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name AccountsList
     * @summary List accounts
     * @request GET:/api/accounts
     * @secure
     */
    accountsList: (params: RequestParams = {}) =>
      this.request<Account[], any>({
        path: `/api/accounts`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name AccountsCreate
     * @summary Create account
     * @request POST:/api/accounts
     * @secure
     */
    accountsCreate: (data: Account, params: RequestParams = {}) =>
      this.request<Account, any>({
        path: `/api/accounts`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name AccountsUpdate
     * @summary Update account
     * @request PUT:/api/accounts/{id}
     * @secure
     */
    accountsUpdate: (id: string, data: Account, params: RequestParams = {}) =>
      this.request<Account, any>({
        path: `/api/accounts/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name AccountsDelete
     * @summary Delete account
     * @request DELETE:/api/accounts/{id}
     * @secure
     */
    accountsDelete: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          message?: string;
        },
        Error
      >({
        path: `/api/accounts/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name TransactionsList
     * @summary List transactions
     * @request GET:/api/transactions
     * @secure
     */
    transactionsList: (params: RequestParams = {}) =>
      this.request<Transaction[], any>({
        path: `/api/transactions`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name TransactionsCreate
     * @summary Create transaction
     * @request POST:/api/transactions
     * @secure
     */
    transactionsCreate: (data: Transaction, params: RequestParams = {}) =>
      this.request<Transaction, any>({
        path: `/api/transactions`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name TransactionsUpdate
     * @summary Update transaction
     * @request PUT:/api/transactions/{id}
     * @secure
     */
    transactionsUpdate: (
      id: string,
      data: Transaction,
      params: RequestParams = {},
    ) =>
      this.request<Transaction, any>({
        path: `/api/transactions/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name TransactionsDelete
     * @summary Delete transaction
     * @request DELETE:/api/transactions/{id}
     * @secure
     */
    transactionsDelete: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          message?: string;
        },
        any
      >({
        path: `/api/transactions/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name AdminStatsList
     * @summary Get system statistics
     * @request GET:/api/admin/stats
     * @secure
     */
    adminStatsList: (params: RequestParams = {}) =>
      this.request<
        {
          users?: number;
          accounts?: number;
          transactions?: number;
          groupExpenses?: number;
        },
        any
      >({
        path: `/api/admin/stats`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name AdminUsersList
     * @summary List all users
     * @request GET:/api/admin/users
     * @secure
     */
    adminUsersList: (params: RequestParams = {}) =>
      this.request<User[], any>({
        path: `/api/admin/users`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name AdminUsersRoleUpdate
     * @summary Update user admin role
     * @request PUT:/api/admin/users/{uid}/role
     * @secure
     */
    adminUsersRoleUpdate: (
      uid: string,
      data: {
        isAdmin?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<User, any>({
        path: `/api/admin/users/${uid}/role`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name AdminMigrateCreate
     * @summary Run data migration
     * @request POST:/api/admin/migrate
     * @secure
     */
    adminMigrateCreate: (params: RequestParams = {}) =>
      this.request<
        {
          message?: string;
        },
        any
      >({
        path: `/api/admin/migrate`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
