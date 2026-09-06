import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId, agencyName = 'Our Agency' } = body;

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
    }

    const cleanAgency = agencyName.trim() || 'Our Agency';

    // 9 Standard High-Converting Rules across the 3 core stages
    const standardRules = [
      // -------------------------------------------------------------
      // STAGE 1: Contact Form Captured (step1_contact)
      // Goal: Force user to complete the survey form
      // -------------------------------------------------------------
      {
        organization_id: organizationId,
        stage_id: 'step1_contact',
        title: `${cleanAgency} - Survey Follow-Up (1h)`,
        trigger_base: 'stage_entered',
        offset_type: 'after',
        offset_value: 1,
        offset_unit: 'hours',
        template: `Hi {{name}}, thank you for contacting ${cleanAgency}! To help us understand your specific goals and prepare your custom strategy, please take 60 seconds to complete your quick questionnaire here: {{survey_url}}`,
        channel: 'whatsapp',
        is_enabled: true,
        apply_to_existing: false,
      },
      {
        organization_id: organizationId,
        stage_id: 'step1_contact',
        title: `${cleanAgency} - Survey Reminder (5h)`,
        trigger_base: 'stage_entered',
        offset_type: 'after',
        offset_value: 5,
        offset_unit: 'hours',
        template: `Hi {{name}}, we noticed you haven't finished your intake questionnaire for ${cleanAgency} yet. Fill it out here so our team can review your business: {{survey_url}}`,
        channel: 'whatsapp',
        is_enabled: true,
        apply_to_existing: false,
      },
      {
        organization_id: organizationId,
        stage_id: 'step1_contact',
        title: `${cleanAgency} - Survey Final Notice (24h)`,
        trigger_base: 'stage_entered',
        offset_type: 'after',
        offset_value: 1,
        offset_unit: 'days',
        template: `Hi {{name}}, final reminder from ${cleanAgency}! Please submit your quick questionnaire today so we can move forward with your consultation: {{survey_url}}`,
        channel: 'whatsapp',
        is_enabled: true,
        apply_to_existing: false,
      },

      // -------------------------------------------------------------
      // STAGE 2: Survey Qualified (survey_completed)
      // Goal: Force user to book a meeting / strategy call
      // -------------------------------------------------------------
      {
        organization_id: organizationId,
        stage_id: 'survey_completed',
        title: `${cleanAgency} - Book Call (1h)`,
        trigger_base: 'stage_entered',
        offset_type: 'after',
        offset_value: 1,
        offset_unit: 'hours',
        template: `Hi {{name}}, thanks for completing your survey with ${cleanAgency}! Your profile is qualified. Lock in your 1-on-1 strategy call with us here: {{meeting_url}}`,
        channel: 'whatsapp',
        is_enabled: true,
        apply_to_existing: false,
      },
      {
        organization_id: organizationId,
        stage_id: 'survey_completed',
        title: `${cleanAgency} - Book Call Urgency (5h)`,
        trigger_base: 'stage_entered',
        offset_type: 'after',
        offset_value: 5,
        offset_unit: 'hours',
        template: `Hi {{name}}, calendar spots are filling up fast at ${cleanAgency}. Reserve your preferred meeting time slot now before this week's spots are gone: {{meeting_url}}`,
        channel: 'whatsapp',
        is_enabled: true,
        apply_to_existing: false,
      },
      {
        organization_id: organizationId,
        stage_id: 'survey_completed',
        title: `${cleanAgency} - Book Call Final (24h)`,
        trigger_base: 'stage_entered',
        offset_type: 'after',
        offset_value: 1,
        offset_unit: 'days',
        template: `Hi {{name}}, don't miss out on your growth strategy session with ${cleanAgency}. Select your calendar slot here: {{meeting_url}}`,
        channel: 'whatsapp',
        is_enabled: true,
        apply_to_existing: false,
      },

      // -------------------------------------------------------------
      // STAGE 3: Meeting Booked (meeting_booked)
      // Goal: Zero no-shows with meeting join link
      // -------------------------------------------------------------
      {
        organization_id: organizationId,
        stage_id: 'meeting_booked',
        title: `${cleanAgency} - Meeting Reminder (24h before)`,
        trigger_base: 'meeting_scheduled',
        offset_type: 'before',
        offset_value: 1,
        offset_unit: 'days',
        template: `Hi {{name}}, reminder: Your strategy session with ${cleanAgency} is scheduled for tomorrow at {{meeting_time}} on {{meeting_date}}. Join link: {{meeting_url}}`,
        channel: 'whatsapp',
        is_enabled: true,
        apply_to_existing: false,
      },
      {
        organization_id: organizationId,
        stage_id: 'meeting_booked',
        title: `${cleanAgency} - Meeting Reminder (1h before)`,
        trigger_base: 'meeting_scheduled',
        offset_type: 'before',
        offset_value: 1,
        offset_unit: 'hours',
        template: `Hi {{name}}, your strategy session with ${cleanAgency} starts in 1 hour! Please join using this link: {{meeting_url}}`,
        channel: 'whatsapp',
        is_enabled: true,
        apply_to_existing: false,
      },
      {
        organization_id: organizationId,
        stage_id: 'meeting_booked',
        title: `${cleanAgency} - Meeting Starting Now (5m before)`,
        trigger_base: 'meeting_scheduled',
        offset_type: 'before',
        offset_value: 5,
        offset_unit: 'minutes',
        template: `Hi {{name}}, we are starting our session with ${cleanAgency} in 5 minutes! Click here to join: {{meeting_url}}`,
        channel: 'whatsapp',
        is_enabled: true,
        apply_to_existing: false,
      },
    ];

    // Insert all 9 rules into stage_automation_rules
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('stage_automation_rules')
      .insert(standardRules)
      .select();

    if (insertErr) {
      console.error('[QuickSetup] Error creating automation rules:', insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: inserted?.length || 0,
      rules: inserted || [],
      message: `Created ${inserted?.length || 0} automated pipeline rules for ${cleanAgency}! ⚡`,
    });
  } catch (err: unknown) {
    console.error('[QuickSetup] Exception:', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to setup agency rules' },
      { status: 500 }
    );
  }
}
