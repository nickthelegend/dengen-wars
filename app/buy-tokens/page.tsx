'use client'

import { AppLayout } from '../../components/layout/AppLayout'
import dynamic from 'next/dynamic'
import styled from 'styled-components'


const BuyTokensContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`

const PageHeader = styled.div`
  background: var(--brutal-lime);
  border: 4px solid var(--border-primary);
  padding: 32px;
  text-align: center;
  box-shadow: 8px 8px 0px 0px var(--border-primary);
`

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 2px;
`

const PageDescription = styled.p`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  font-family: var(--font-mono);
`

const LoadingCard = styled.div`
  background: var(--brutal-yellow);
  border: 4px solid var(--border-primary);
  padding: 32px;
  box-shadow: 8px 8px 0px 0px var(--border-primary);
  max-width: 400px;
  width: 100%;
  text-align: center;
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--text-primary);
`

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`

const InfoCard = styled.div`
  background: var(--light-bg);
  border: 4px solid var(--border-primary);
  padding: 24px;
  box-shadow: 6px 6px 0px 0px var(--border-primary);
`

const InfoTitle = styled.h3`
  font-size: 20px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 1px;
`

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const InfoItem = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
`

const HowItWorksSection = styled.div`
  background: var(--brutal-cyan);
  border: 4px solid var(--border-primary);
  padding: 24px;
  box-shadow: 6px 6px 0px 0px var(--border-primary);
`

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 2px;
`

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`

const StepCard = styled.div`
  background: var(--light-bg);
  border: 3px solid var(--border-primary);
  padding: 20px;
  text-align: center;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
`

const StepNumber = styled.div`
  font-size: 32px;
  font-weight: 900;
  color: var(--brutal-red);
  font-family: var(--font-mono);
  margin-bottom: 12px;
`

const StepTitle = styled.div`
  font-size: 16px;
  font-weight: 900;
  color: var(--text-primary);
  font-family: var(--font-mono);
  margin-bottom: 8px;
  text-transform: uppercase;
`

const StepDescription = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
`

export default function BuyTokensPage() {
  return (
    <AppLayout>
      <BuyTokensContainer>
        
        <PageHeader>
          <PageTitle>⚡ INSTANT DEGEN SWAP</PageTitle>
          <PageDescription>
            Instantly swap ALGO for DEGEN tokens using atomic transactions - safe & instant!
          </PageDescription>
        </PageHeader>


        <InfoGrid>
          <InfoCard>
            <InfoTitle>⚡ Atomic Swap Benefits</InfoTitle>
            <InfoList>
              <InfoItem>• Instant token delivery</InfoItem>
              <InfoItem>• 100% safe & trustless</InfoItem>
              <InfoItem>• No manual processing</InfoItem>
              <InfoItem>• Guaranteed execution</InfoItem>
              <InfoItem>• One-click experience</InfoItem>
            </InfoList>
          </InfoCard>

          <InfoCard>
            <InfoTitle>📊 Swap Details</InfoTitle>
            <InfoList>
              <InfoItem>• Rate: 1 ALGO = 10,000 DEGEN</InfoItem>
              <InfoItem>• Min: 0.1 ALGO per swap</InfoItem>
              <InfoItem>• Max: 100 ALGO per swap</InfoItem>
              <InfoItem>• Network: Algorand Testnet</InfoItem>
              <InfoItem>• Asset ID: 745007115</InfoItem>
            </InfoList>
          </InfoCard>
        </InfoGrid>

        <HowItWorksSection>
          <SectionTitle>⚡ How Atomic Swap Works</SectionTitle>
          <StepsGrid>
            <StepCard>
              <StepNumber>1️⃣</StepNumber>
              <StepTitle>Enter Amount</StepTitle>
              <StepDescription>
                Enter how much ALGO you want to swap
              </StepDescription>
            </StepCard>
            <StepCard>
              <StepNumber>2️⃣</StepNumber>
              <StepTitle>Sign Transaction</StepTitle>
              <StepDescription>
                Sign the atomic swap transaction in your wallet
              </StepDescription>
            </StepCard>
            <StepCard>
              <StepNumber>3️⃣</StepNumber>
              <StepTitle>Instant Delivery</StepTitle>
              <StepDescription>
                Receive DEGEN tokens instantly and safely
              </StepDescription>
            </StepCard>
          </StepsGrid>
        </HowItWorksSection>

      </BuyTokensContainer>
    </AppLayout>
  )
}