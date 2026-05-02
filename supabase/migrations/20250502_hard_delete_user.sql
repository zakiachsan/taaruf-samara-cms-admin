-- Function untuk menghapus user secara permanen (hard delete)
-- Hanya menghapus tabel PUBLIC. Auth user dihapus via supabaseAdmin.auth.admin.deleteUser() di frontend.
-- 100% text-based comparison untuk menghindari mismatch tipe uuid/varchar

DROP FUNCTION IF EXISTS hard_delete_user(UUID);
DROP FUNCTION IF EXISTS hard_delete_user(TEXT);
DROP FUNCTION IF EXISTS admin_hard_delete_user(TEXT);

CREATE OR REPLACE FUNCTION admin_hard_delete_user(p_user_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Mentoring sessions (child of subscription_purchases)
  BEGIN DELETE FROM mentoring_sessions WHERE user_id::text = p_user_id;
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'mentoring_sessions skip: %', SQLERRM; END;

  -- 2. Purchase addons (kolom: purchase_id, BUKAN subscription_purchase_id)
  BEGIN DELETE FROM purchase_addons
  WHERE purchase_id::text IN (
    SELECT id::text FROM subscription_purchases WHERE user_id::text = p_user_id
  );
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'purchase_addons skip: %', SQLERRM; END;

  -- 3. Subscription purchases
  BEGIN DELETE FROM subscription_purchases WHERE user_id::text = p_user_id;
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'subscription_purchases skip: %', SQLERRM; END;

  -- 4. Premium subscriptions
  BEGIN DELETE FROM premium_subscriptions WHERE user_id::text = p_user_id;
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'premium_subscriptions skip: %', SQLERRM; END;

  -- 5. Chat messages
  BEGIN DELETE FROM chat_messages WHERE sender_id::text = p_user_id;
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'chat_messages skip: %', SQLERRM; END;

  -- 6. Chats (participant_ids adalah array)
  BEGIN DELETE FROM chats WHERE EXISTS (
    SELECT 1 FROM unnest(participant_ids) AS pid WHERE pid::text = p_user_id
  );
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'chats skip: %', SQLERRM; END;

  -- 7. Reports
  BEGIN DELETE FROM reports WHERE reporter_id::text = p_user_id OR reported_id::text = p_user_id;
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'reports skip: %', SQLERRM; END;

  -- 8. Blocked users
  BEGIN DELETE FROM blocked_users WHERE blocker_id::text = p_user_id OR blocked_id::text = p_user_id;
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'blocked_users skip: %', SQLERRM; END;

  -- 9. Match requests
  BEGIN DELETE FROM match_requests WHERE requester_id::text = p_user_id OR recipient_id::text = p_user_id;
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'match_requests skip: %', SQLERRM; END;

  -- 10. Referral withdrawals
  BEGIN DELETE FROM referral_withdrawals WHERE user_id::text = p_user_id;
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'referral_withdrawals skip: %', SQLERRM; END;

  -- 11. Referrals
  BEGIN DELETE FROM referrals WHERE referrer_id::text = p_user_id OR referred_id::text = p_user_id;
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'referrals skip: %', SQLERRM; END;

  -- 12. Self-value registrations
  BEGIN DELETE FROM self_value_registrations WHERE user_id::text = p_user_id;
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'self_value_registrations skip: %', SQLERRM; END;

  -- 13. Chat violations
  BEGIN DELETE FROM chat_violations WHERE user_id::text = p_user_id;
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'chat_violations skip: %', SQLERRM; END;

  -- 14. Addon admin alerts
  BEGIN DELETE FROM addon_admin_alerts WHERE user_id::text = p_user_id;
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'addon_admin_alerts skip: %', SQLERRM; END;

  -- 15. User profiles & public users (CRITICAL)
  DELETE FROM user_profiles WHERE user_id::text = p_user_id;
  DELETE FROM public.users WHERE id::text = p_user_id;
END;
$$;
