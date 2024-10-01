import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface KoalaWelcomeEmailProps {
  name: string;
}

export const AccountCreation = ({ name }: KoalaWelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>
      The sales intelligence platform that helps you uncover qualified leads.
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={paragraph}>Hi {name},</Text>
        <Text style={paragraph}>
          We’re excited to have you on board. Whether you’re here to [explore
          courses, create content, or collaborate with others], you’re now part
          of a growing community that’s passionate about learning and growth. To
          get started, simply log in to your account and explore the features
          we’ve tailored just for you. If you have any questions, feel free to
          reach out—we’re here to help!
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href="https://localhost:3000/dashboard">
            Get started
          </Button>
        </Section>
        <Text style={paragraph}>
          Best,
          <br />
          The BrightPath team
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          Thank you for joining us—let’s make learning a journey to remember!
        </Text>
      </Container>
    </Body>
  </Html>
);

AccountCreation.PreviewProps = {
  name: 'Priyobroto Kar',
} as KoalaWelcomeEmailProps;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
};

const logo = {
  margin: '0 auto',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
};

const btnContainer = {
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#5F51E8',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
};

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
};
