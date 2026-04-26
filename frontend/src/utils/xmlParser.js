/**
 * XML Parsing and Generation Utilities
 * Handles conversion between XML strings and JavaScript objects for ORE configuration files
 */

// ==================== ORE XML Parser ====================

export function parseOREXML(xmlString) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'text/xml')

  const getParam = (parent, name) => {
    const param = parent.querySelector(`Parameter[name="${name}"]`)
    return param ? param.textContent : ''
  }

  const setup = doc.querySelector('Setup')
  const analytics = doc.querySelector('Analytics')
  const markets = doc.querySelector('Markets')

  return {
    setup: {
      asofDate: getParam(setup, 'asofDate'),
      inputPath: getParam(setup, 'inputPath'),
      outputPath: getParam(setup, 'outputPath'),
      marketDataFile: getParam(setup, 'marketDataFile'),
      fixingDataFile: getParam(setup, 'fixingDataFile'),
      curveConfigFile: getParam(setup, 'curveConfigFile'),
      conventionsFile: getParam(setup, 'conventionsFile'),
      marketConfigFile: getParam(setup, 'marketConfigFile'),
      pricingEnginesFile: getParam(setup, 'pricingEnginesFile'),
      portfolioFile: getParam(setup, 'portfolioFile'),
      logFile: getParam(setup, 'logFile'),
      logMask: getParam(setup, 'logMask'),
      implyTodaysFixings: getParam(setup, 'implyTodaysFixings'),
    },
    markets: {
      lgmcalibration: getParam(markets, 'lgmcalibration'),
      fxcalibration: getParam(markets, 'fxcalibration'),
      eqcalibration: getParam(markets, 'eqcalibration'),
      pricing: getParam(markets, 'pricing'),
      simulation: getParam(markets, 'simulation'),
    },
    analytics: {
      npv: {
        active: getParam(analytics.querySelector('Analytic[type="npv"]'), 'active'),
        baseCurrency: getParam(analytics.querySelector('Analytic[type="npv"]'), 'baseCurrency'),
        outputFileName: getParam(analytics.querySelector('Analytic[type="npv"]'), 'outputFileName'),
      },
      cashflow: {
        active: getParam(analytics.querySelector('Analytic[type="cashflow"]'), 'active'),
        outputFileName: getParam(
          analytics.querySelector('Analytic[type="cashflow"]'),
          'outputFileName'
        ),
      },
      curves: {
        active: getParam(analytics.querySelector('Analytic[type="curves"]'), 'active'),
        configuration: getParam(
          analytics.querySelector('Analytic[type="curves"]'),
          'configuration'
        ),
        grid: getParam(analytics.querySelector('Analytic[type="curves"]'), 'grid'),
        outputFileName: getParam(
          analytics.querySelector('Analytic[type="curves"]'),
          'outputFileName'
        ),
      },
    },
  }
}

export function generateOREXML(data) {
  const { setup, markets, analytics } = data

  return `<?xml version="1.0"?>
<ORE>
  <Setup>
    <Parameter name="asofDate">${setup.asofDate}</Parameter>
    <Parameter name="inputPath">${setup.inputPath}</Parameter>
    <Parameter name="outputPath">${setup.outputPath}</Parameter>
    <Parameter name="marketDataFile">${setup.marketDataFile}</Parameter>
    <Parameter name="fixingDataFile">${setup.fixingDataFile}</Parameter>
    <Parameter name="curveConfigFile">${setup.curveConfigFile}</Parameter>
    <Parameter name="conventionsFile">${setup.conventionsFile}</Parameter>
    <Parameter name="marketConfigFile">${setup.marketConfigFile}</Parameter>
    <Parameter name="pricingEnginesFile">${setup.pricingEnginesFile}</Parameter>
    <Parameter name="portfolioFile">${setup.portfolioFile}</Parameter>
    <Parameter name="logFile">${setup.logFile}</Parameter>
    <Parameter name="logMask">${setup.logMask}</Parameter>
    <Parameter name="implyTodaysFixings">${setup.implyTodaysFixings}</Parameter>
  </Setup>
  <Markets>
    <Parameter name="lgmcalibration">${markets.lgmcalibration}</Parameter>
    <Parameter name="fxcalibration">${markets.fxcalibration}</Parameter>
    <Parameter name="eqcalibration">${markets.eqcalibration}</Parameter>
    <Parameter name="pricing">${markets.pricing}</Parameter>
    <Parameter name="simulation">${markets.simulation}</Parameter>
  </Markets>
  <Analytics>
    <Analytic type="npv">
      <Parameter name="active">${analytics.npv.active}</Parameter>
      <Parameter name="baseCurrency">${analytics.npv.baseCurrency}</Parameter>
      <Parameter name="outputFileName">${analytics.npv.outputFileName}</Parameter>
    </Analytic>
    <Analytic type="cashflow">
      <Parameter name="active">${analytics.cashflow.active}</Parameter>
      <Parameter name="outputFileName">${analytics.cashflow.outputFileName}</Parameter>
    </Analytic>
    <Analytic type="curves">
      <Parameter name="active">${analytics.curves.active}</Parameter>
      <Parameter name="configuration">${analytics.curves.configuration}</Parameter>
      <Parameter name="grid">${analytics.curves.grid}</Parameter>
      <Parameter name="outputFileName">${analytics.curves.outputFileName}</Parameter>
    </Analytic>
  </Analytics>
</ORE>`
}

// ==================== IR Swap XML Parser ====================

export function parseIRSwapXML(xmlString) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'text/xml')

  const trade = doc.querySelector('Trade')
  const envelope = trade.querySelector('Envelope')
  const swapData = trade.querySelector('SwapData')
  const legs = swapData.querySelectorAll('LegData')

  const fixedLeg = Array.from(legs).find(
    (leg) => leg.querySelector('LegType').textContent === 'Fixed'
  )
  const floatingLeg = Array.from(legs).find(
    (leg) => leg.querySelector('LegType').textContent === 'Floating'
  )

  const getText = (parent, tag) => {
    const el = parent.querySelector(tag)
    return el ? el.textContent : ''
  }

  const parseLegData = (leg) => {
    const scheduleRules = leg.querySelector('ScheduleData Rules')
    return {
      legType: getText(leg, 'LegType'),
      payer: getText(leg, 'Payer') === 'true',
      currency: getText(leg, 'Currency'),
      notional: getText(leg.querySelector('Notionals'), 'Notional'),
      dayCounter: getText(leg, 'DayCounter'),
      paymentConvention: getText(leg, 'PaymentConvention'),
      startDate: getText(scheduleRules, 'StartDate'),
      endDate: getText(scheduleRules, 'EndDate'),
      tenor: getText(scheduleRules, 'Tenor'),
      calendar: getText(scheduleRules, 'Calendar'),
      convention: getText(scheduleRules, 'Convention'),
      termConvention: getText(scheduleRules, 'TermConvention'),
      rule: getText(scheduleRules, 'Rule'),
    }
  }

  const fixedData = fixedLeg.querySelector('FixedLegData')
  const floatingData = floatingLeg.querySelector('FloatingLegData')

  return {
    tradeId: trade.getAttribute('id'),
    tradeType: getText(trade, 'TradeType'),
    counterParty: getText(envelope, 'CounterParty'),
    nettingSetId: getText(envelope, 'NettingSetId'),
    fixedLeg: {
      ...parseLegData(fixedLeg),
      rate: getText(fixedData.querySelector('Rates'), 'Rate'),
    },
    floatingLeg: {
      ...parseLegData(floatingLeg),
      index: getText(floatingData, 'Index'),
      spread: getText(floatingData.querySelector('Spreads'), 'Spread'),
      isInArrears: getText(floatingData, 'IsInArrears') === 'true',
      fixingDays: getText(floatingData, 'FixingDays'),
    },
  }
}

export function generateIRSwapXML(data) {
  const { tradeId, tradeType, counterParty, nettingSetId, fixedLeg, floatingLeg } = data

  return `<?xml version="1.0"?>
<Portfolio>
  <Trade id="${tradeId}">
    <TradeType>${tradeType}</TradeType>
    <Envelope>
      <CounterParty>${counterParty}</CounterParty>
      <NettingSetId>${nettingSetId}</NettingSetId>
      <AdditionalFields/>
    </Envelope>
    <SwapData>
      <LegData>
        <LegType>Fixed</LegType>
        <Payer>${fixedLeg.payer}</Payer>
        <Currency>${fixedLeg.currency}</Currency>
        <Notionals>
          <Notional>${fixedLeg.notional}</Notional>
        </Notionals>
        <DayCounter>${fixedLeg.dayCounter}</DayCounter>
        <PaymentConvention>${fixedLeg.paymentConvention}</PaymentConvention>
        <FixedLegData>
          <Rates>
            <Rate>${fixedLeg.rate}</Rate>
          </Rates>
        </FixedLegData>
        <ScheduleData>
          <Rules>
            <StartDate>${fixedLeg.startDate}</StartDate>
            <EndDate>${fixedLeg.endDate}</EndDate>
            <Tenor>${fixedLeg.tenor}</Tenor>
            <Calendar>${fixedLeg.calendar}</Calendar>
            <Convention>${fixedLeg.convention}</Convention>
            <TermConvention>${fixedLeg.termConvention}</TermConvention>
            <Rule>${fixedLeg.rule}</Rule>
            <EndOfMonth/>
            <FirstDate/>
            <LastDate/>
          </Rules>
        </ScheduleData>
      </LegData>
      <LegData>
        <LegType>Floating</LegType>
        <Payer>${floatingLeg.payer}</Payer>
        <Currency>${floatingLeg.currency}</Currency>
        <Notionals>
          <Notional>${floatingLeg.notional}</Notional>
        </Notionals>
        <DayCounter>${floatingLeg.dayCounter}</DayCounter>
        <PaymentConvention>${floatingLeg.paymentConvention}</PaymentConvention>
        <FloatingLegData>
          <Index>${floatingLeg.index}</Index>
          <Spreads>
            <Spread>${floatingLeg.spread}</Spread>
          </Spreads>
          <IsInArrears>${floatingLeg.isInArrears}</IsInArrears>
          <FixingDays>${floatingLeg.fixingDays}</FixingDays>
        </FloatingLegData>
        <ScheduleData>
          <Rules>
            <StartDate>${floatingLeg.startDate}</StartDate>
            <EndDate>${floatingLeg.endDate}</EndDate>
            <Tenor>${floatingLeg.tenor}</Tenor>
            <Calendar>${floatingLeg.calendar}</Calendar>
            <Convention>${floatingLeg.convention}</Convention>
            <TermConvention>${floatingLeg.termConvention}</TermConvention>
            <Rule>${floatingLeg.rule}</Rule>
            <EndOfMonth/>
            <FirstDate/>
            <LastDate/>
          </Rules>
        </ScheduleData>
      </LegData>
    </SwapData>
  </Trade>
</Portfolio>`
}

// ==================== Conventions XML Parser ====================

export function parseConventionsXML(xmlString) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'text/xml')

  const getText = (parent, tag) => {
    const el = parent.querySelector(tag)
    return el ? el.textContent : ''
  }

  const getBool = (parent, tag) => {
    const el = parent.querySelector(tag)
    return el ? el.textContent === 'true' : false
  }

  // Parse Deposit conventions
  const deposits = []
  doc.querySelectorAll('Deposit').forEach((dep) => {
    deposits.push({
      id: getText(dep, 'Id'),
      indexBased: getBool(dep, 'IndexBased'),
      index: getText(dep, 'Index'),
    })
  })

  // Parse OIS conventions
  const oisConventions = []
  doc.querySelectorAll('OIS').forEach((ois) => {
    oisConventions.push({
      id: getText(ois, 'Id'),
      spotLag: getText(ois, 'SpotLag'),
      index: getText(ois, 'Index'),
      fixedDayCounter: getText(ois, 'FixedDayCounter'),
      paymentLag: getText(ois, 'PaymentLag'),
      eom: getBool(ois, 'EOM'),
      fixedFrequency: getText(ois, 'FixedFrequency'),
      fixedConvention: getText(ois, 'FixedConvention'),
      fixedPaymentConvention: getText(ois, 'FixedPaymentConvention'),
      rule: getText(ois, 'Rule'),
    })
  })

  // Parse Swap conventions
  const swapConventions = []
  doc.querySelectorAll('Swap').forEach((swap) => {
    swapConventions.push({
      id: getText(swap, 'Id'),
      fixedCalendar: getText(swap, 'FixedCalendar'),
      fixedFrequency: getText(swap, 'FixedFrequency'),
      fixedConvention: getText(swap, 'FixedConvention'),
      fixedDayCounter: getText(swap, 'FixedDayCounter'),
      index: getText(swap, 'Index'),
    })
  })

  return {
    deposits,
    ois: oisConventions,
    swaps: swapConventions,
  }
}

export function generateConventionsXML(data) {
  const { deposits, ois, swaps } = data

  let xml = `<?xml version="1.0" encoding="utf-8"?>
<Conventions>
`

  // Deposit conventions
  deposits.forEach((dep) => {
    xml += `  <Deposit>
    <Id>${dep.id}</Id>
    <IndexBased>${dep.indexBased}</IndexBased>
    <Index>${dep.index}</Index>
  </Deposit>
`
  })

  // OIS conventions
  ois.forEach((o) => {
    xml += `  <OIS>
    <Id>${o.id}</Id>
    <SpotLag>${o.spotLag}</SpotLag>
    <Index>${o.index}</Index>
    <FixedDayCounter>${o.fixedDayCounter}</FixedDayCounter>
    <PaymentLag>${o.paymentLag}</PaymentLag>
    <EOM>${o.eom}</EOM>
    <FixedFrequency>${o.fixedFrequency}</FixedFrequency>
    <FixedConvention>${o.fixedConvention}</FixedConvention>
    <FixedPaymentConvention>${o.fixedPaymentConvention}</FixedPaymentConvention>
    <Rule>${o.rule}</Rule>
  </OIS>
`
  })

  // Swap conventions
  swaps.forEach((s) => {
    xml += `  <Swap>
    <Id>${s.id}</Id>
    <FixedCalendar>${s.fixedCalendar}</FixedCalendar>
    <FixedFrequency>${s.fixedFrequency}</FixedFrequency>
    <FixedConvention>${s.fixedConvention}</FixedConvention>
    <FixedDayCounter>${s.fixedDayCounter}</FixedDayCounter>
    <Index>${s.index}</Index>
  </Swap>
`
  })

  xml += `</Conventions>`

  return xml
}
