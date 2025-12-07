import { redirect } from 'next/navigation';

export default async function MovieDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  // Redirect to seasons page as the default view for a movie
  redirect(`/movies/${params.id}/seasons`);
}
