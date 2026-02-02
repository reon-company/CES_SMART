-- MODULE_001의 user_id를 1로 변경
UPDATE modules SET user_id = 1 WHERE module_id = 'MODULE_001';

-- 확인
SELECT id, name, module_id, user_id, status FROM modules ORDER BY id;
