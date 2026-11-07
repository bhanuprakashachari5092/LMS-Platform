import React from 'react';
import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'Course' | 'Person' | string;
  data: Record<string, any>;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

export const OrganizationSchema: React.FC = () => {
  const data = {
    name: 'KaizenQ',
    alternateName: ['Kaizen Q', 'KaizenQ Academy', 'KaizenQ LMS'],
    url: 'https://www.kaizenq.in',
    logo: 'https://res.cloudinary.com/kggovcsf/image/upload/v1787058675/Kaizen_Q_Symbol_Logo1.png',
    description: 'KaizenQ — Modern Global Learning Platform & Virtual Internship Accelerator by Shaivika Groups for AI, Cloud & Software Engineering Skills.',
    foundingLocation: 'India',
    parentOrganization: {
      '@type': 'Organization',
      name: 'Shaivika Groups',
      url: 'https://www.shaivikaittechnologies.in',
    },
    founder: [
      {
        '@type': 'Person',
        name: 'Bhanu Prakash',
        alternateName: 'Banu Prakash',
        jobTitle: 'Co-Founder of KaizenQ',
        url: 'https://www.kaizenq.in',
        worksFor: {
          '@type': 'Organization',
          name: 'KaizenQ',
          url: 'https://www.kaizenq.in',
        },
      },
    ],
    sameAs: [
      'https://www.shaivikaittechnologies.in',
      'https://github.com/bhanuprakashachari5092/LMS-Platform',
    ],
  };

  return <StructuredData type="Organization" data={data} />;
};

export interface CoFounderSchemaProps {
  name?: string;
  alternateName?: string;
  jobTitle?: string;
  url?: string;
  image?: string;
  description?: string;
  sameAs?: string[];
}

export const CoFounderSchema: React.FC<CoFounderSchemaProps> = ({
  name = 'Bhanu Prakash',
  alternateName = 'Banu Prakash',
  jobTitle = 'Co-Founder of KaizenQ',
  url = 'https://www.kaizenq.in',
  image = 'https://res.cloudinary.com/kggovcsf/image/upload/v1787058675/Kaizen_Q_Symbol_Logo1.png',
  description = 'Bhanu Prakash is the Co-Founder of KaizenQ (Shaivika Groups), leading innovation in practical software engineering education, AI-driven learning platforms, and industry-grade virtual internships.',
  sameAs = [
    'https://www.kaizenq.in',
    'https://github.com/bhanuprakashachari5092',
    'https://www.shaivikaittechnologies.in',
  ],
}) => {
  const data = {
    name,
    alternateName,
    jobTitle,
    url,
    image,
    description,
    worksFor: {
      '@type': 'Organization',
      name: 'KaizenQ',
      url: 'https://www.kaizenq.in',
      parentOrganization: {
        '@type': 'Organization',
        name: 'Shaivika Groups',
        url: 'https://www.shaivikaittechnologies.in',
      },
    },
    affiliation: {
      '@type': 'Organization',
      name: 'Shaivika Groups',
      url: 'https://www.shaivikaittechnologies.in',
    },
    knowsAbout: [
      'Co-Founder of KaizenQ',
      'Learning Management Systems',
      'Virtual & Hybrid Internships',
      'Full Stack Web Architecture',
      'Cloud & DevOps Engineering',
      'AI Systems & Machine Learning Education',
    ],
    sameAs,
  };

  return <StructuredData type="Person" data={data} />;
};

interface CourseSchemaProps {
  name: string;
  description: string;
  providerName?: string;
  url?: string;
}

export const CourseSchema: React.FC<CourseSchemaProps> = ({ 
  name, 
  description, 
  providerName = 'Kaizen Q',
  url 
}) => {
  const data = {
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: providerName,
      sameAs: 'https://www.kaizenq.in'
    },
    ...(url && { url }),
  };

  return <StructuredData type="Course" data={data} />;
};
