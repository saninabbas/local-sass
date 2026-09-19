-- Seed User
INSERT INTO users (id, name, email) 
VALUES ('usr_dev_01', 'Alex', 'alex@abcdental.com');

-- Seed Business
INSERT INTO businesses (id, user_id, name, type, city, website_url) 
VALUES ('biz_dev_01', 'usr_dev_01', 'ABC Dental', 'Dentist', 'Islamabad', 'https://example.com');

-- Seed initial audit
INSERT INTO audits (id, business_id, status, score, completed_at)
VALUES ('aud_dev_01', 'biz_dev_01', 'completed', 78, CURRENT_TIMESTAMP);

-- Seed Growth Score
INSERT INTO growth_scores (
  id, audit_id, business_id, overall_score, seo_score, reviews_score, website_score, visibility_score, previous_score, score_change
) VALUES (
  'sco_dev_01', 'aud_dev_01', 'biz_dev_01', 78, 82, 74, 86, 69, 72, 6
);

-- Seed Recommendations
INSERT INTO recommendations (
  id, audit_id, business_id, priority, priority_color, title, description, impact, estimated_minutes, status, action_link
) VALUES 
('rec_dev_01', 'aud_dev_01', 'biz_dev_01', 'HIGH PRIORITY', 'text-danger bg-red-50 border-red-100', 'Respond to unanswered reviews', '8 recent reviews are waiting for a response.', 'High', '15 min', 'pending', '/dashboard/reviews'),
('rec_dev_02', 'aud_dev_01', 'biz_dev_01', 'MEDIUM PRIORITY', 'text-warning bg-orange-50 border-orange-100', 'Create missing service pages', '3 important service pages are missing.', 'Medium', '30 min', 'pending', '/dashboard/website'),
('rec_dev_03', 'aud_dev_01', 'biz_dev_01', 'MEDIUM PRIORITY', 'text-warning bg-orange-50 border-orange-100', 'Fix website issues', '2 issues detected.', 'Medium', '20 min', 'pending', '/dashboard/website');
