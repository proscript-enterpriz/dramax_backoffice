import { Film, Layers, Play, Tags, Users } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCategories } from '@/services/categories';
import { getGenres } from '@/services/genres';
import { getMovies } from '@/services/movies-generated';
import { getSubscriptionUsers } from '@/services/subscriptions';
import { getTags } from '@/services/tags';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch counts from existing APIs
  const [moviesRes, categoriesRes, genresRes, tagsRes, subscriptionsRes] =
    await Promise.all([
      getMovies({ page: 1, page_size: 10 }),
      getCategories({ page: 1, page_size: 1 }),
      getGenres({ page: 1, page_size: 1 }),
      getTags({ page: 1, page_size: 1 }),
      getSubscriptionUsers({ status: 'active', limit: 10 }),
    ]);

  const stats = [
    {
      title: 'Нийт кино',
      value: moviesRes?.total_count ?? 0,
      icon: Film,
      href: '/movies',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
    },
    {
      title: 'Ангилал',
      value: categoriesRes?.total_count ?? 0,
      icon: Layers,
      href: '/categories',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
    },
    {
      title: 'Төрөл',
      value: genresRes?.total_count ?? 0,
      icon: Play,
      href: '/genres',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950',
    },
    {
      title: 'Таг',
      value: tagsRes?.total_count ?? 0,
      icon: Tags,
      href: '/tags',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-950',
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Хяналтын самбар</h1>
        <p className="text-muted-foreground mt-2">
          Системийн үндсэн мэдээлэл болон статистик
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="cursor-pointer transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.bgColor} rounded-lg p-2`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stat.value.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Үзэхийн тулд дарна уу
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Active Subscribers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>Идэвхитэй гишүүд</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {subscriptionsRes?.total_count ?? 0}
                </Badge>
              </div>
              <Link
                href="/subscriptions"
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                Бүгдийг харах →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {subscriptionsRes?.data && subscriptionsRes.data.length > 0 ? (
              <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
                {subscriptionsRes.data.map((sub) => {
                  const expiresAt = new Date(sub.expires_at);
                  const now = new Date();
                  const daysLeft = Math.ceil(
                    (expiresAt.getTime() - now.getTime()) /
                      (1000 * 60 * 60 * 24),
                  );

                  return (
                    <Link
                      key={sub.user_id}
                      href={`/subscriptions?user_id=${sub.user_id}`}
                      className="group block"
                    >
                      <div className="hover:bg-muted/50 rounded-lg border p-3 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="group-hover:text-primary truncate text-sm font-medium">
                                {sub.name || sub.email}
                              </p>
                              <Badge
                                variant={
                                  sub.status === 'active'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {sub.plan}
                              </Badge>
                            </div>
                            {sub.name && (
                              <p className="text-muted-foreground truncate text-xs">
                                {sub.email}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
                          <span>
                            {new Date(sub.started_at).toLocaleDateString(
                              'mn-MN',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              },
                            )}{' '}
                            - Эхлэсэн
                          </span>
                          <span
                            className={
                              daysLeft <= 7
                                ? 'text-destructive font-medium'
                                : daysLeft <= 30
                                  ? 'font-medium text-orange-600'
                                  : ''
                            }
                          >
                            {daysLeft > 0
                              ? `${daysLeft} өдөр үлдсэн`
                              : 'Дууссан'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-muted-foreground py-8 text-center text-sm">
                Идэвхитэй гишүүд байхгүй байна
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Movies */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Сүүлд нэмэгдсэн кино</CardTitle>
              <Link
                href="/movies"
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                Бүгдийг харах →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {moviesRes?.data && moviesRes.data.length > 0 ? (
              <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
                {moviesRes.data.map((movie) => (
                  <Link
                    key={movie.id}
                    href={`/movies/${movie.id}`}
                    className="group block"
                  >
                    <div className="hover:bg-muted/50 flex items-center gap-3 rounded-lg p-2 transition-colors">
                      {movie.poster_url ? (
                        <img
                          src={movie.poster_url}
                          alt={movie.title}
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : (
                        <div className="bg-muted flex h-12 w-12 items-center justify-center rounded">
                          <Film className="text-muted-foreground h-6 w-6" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="group-hover:text-primary truncate text-sm font-medium">
                          {movie.title}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {movie.year ?? 'N/A'} •{' '}
                          {movie.is_premium ? 'Premium' : 'Үнэгүй'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground py-8 text-center text-sm">
                Кино байхгүй байна
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Түргэн үйлдэл</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Link href="/movies">
              <div className="hover:border-primary hover:bg-primary/5 group flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all">
                <div className="rounded-lg bg-blue-100 p-2 transition-transform group-hover:scale-110 dark:bg-blue-950">
                  <Film className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Кино удирдах</p>
                  <p className="text-muted-foreground text-xs">
                    Кино нэмэх, засах
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/categories">
              <div className="hover:border-primary hover:bg-primary/5 group flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all">
                <div className="rounded-lg bg-purple-100 p-2 transition-transform group-hover:scale-110 dark:bg-purple-950">
                  <Layers className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Ангилал</p>
                  <p className="text-muted-foreground text-xs">
                    Ангилал удирдах
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/streams">
              <div className="hover:border-primary hover:bg-primary/5 group flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all">
                <div className="rounded-lg bg-green-100 p-2 transition-transform group-hover:scale-110 dark:bg-green-950">
                  <Play className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Стрим</p>
                  <p className="text-muted-foreground text-xs">Стрим удирдах</p>
                </div>
              </div>
            </Link>
            <Link href="/employees">
              <div className="hover:border-primary hover:bg-primary/5 group flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all">
                <div className="rounded-lg bg-orange-100 p-2 transition-transform group-hover:scale-110 dark:bg-orange-950">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Ажилчид</p>
                  <p className="text-muted-foreground text-xs">
                    Хэрэглэгч удирдах
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
