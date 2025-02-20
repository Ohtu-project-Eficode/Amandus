export interface Repository {
    id: string
    name: string
    full_name: string
    clone_url: string
    html_url: string
    service: string
}

export interface GitHubRepository {
    id: number,
    name: string,
    full_name: string,
    clone_url: string,
    html_url: string,
}

export interface BitbucketRepositories {
    values: [
        {
            uuid: string,
            name: string,
            full_name: string,
            links: {
                clone: [
                        {
                            href: string,
                            name: string
                        }
                ],
                html: {
                    href: string
                }
            }
        }
    ]
}

export interface GitLabRepository {
    id: number,
    name: string,
    path_with_namespace: string,
    http_url_to_repo: string,
    web_url: string
}

export type ServiceRepository = GitHubRepository |BitbucketRepositories |GitLabRepository