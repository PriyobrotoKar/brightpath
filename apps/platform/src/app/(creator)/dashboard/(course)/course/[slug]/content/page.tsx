import React from 'react';
import Header from '../../../../_components/Header';
import ContentTable from './_components/Content';
import { getModulesByCourseSlug } from '@/api/services/module';

export default async function ContentManagementPage({
  params: { slug },
  searchParams,
}: {
  params: { slug: string };
  searchParams: Promise<{ status: string; createdAt: string; sort: string }>;
}): Promise<React.JSX.Element> {
  const { status, createdAt, sort } = await searchParams;

  const modules = await getModulesByCourseSlug(slug, {
    status,
    createdAt,
    sort,
  });

  return (
    <div>
      <Header
        subtitle="The central repository for all your course materials"
        title="Content Library"
      />
      <ContentTable modules={modules} />
    </div>
  );
}
