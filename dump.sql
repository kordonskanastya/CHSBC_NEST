--
-- PostgreSQL database dump
--

-- Dumped from database version 14.3
-- Dumped by pg_dump version 14.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    name character varying NOT NULL,
    credits integer NOT NULL,
    "lectureHours" integer NOT NULL,
    "isActive" boolean NOT NULL,
    semester integer NOT NULL,
    "isCompulsory" boolean NOT NULL,
    "teacherId" integer,
    "isExam" boolean DEFAULT false NOT NULL,
    "gradeId" integer,
    "voteRequiredCoursesId" integer,
    "voteNotRequiredCoursesId" integer,
    created timestamp with time zone DEFAULT now() NOT NULL,
    updated timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- Name: courses_groups_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses_groups_groups (
    "coursesId" integer NOT NULL,
    "groupsId" integer NOT NULL
);


ALTER TABLE public.courses_groups_groups OWNER TO postgres;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.courses_id_seq OWNER TO postgres;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: courses_students_students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses_students_students (
    "coursesId" integer NOT NULL,
    "studentsId" integer NOT NULL
);


ALTER TABLE public.courses_students_students OWNER TO postgres;

--
-- Name: grades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grades (
    id integer NOT NULL,
    grade integer DEFAULT 0 NOT NULL,
    "studentId" integer,
    created timestamp with time zone DEFAULT now() NOT NULL,
    updated timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.grades OWNER TO postgres;

--
-- Name: grades-history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."grades-history" (
    id integer NOT NULL,
    grade integer DEFAULT 0 NOT NULL,
    "reasonOfChange" character varying,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "studentId" integer,
    "courseId" integer,
    "userChangedId" integer
);


ALTER TABLE public."grades-history" OWNER TO postgres;

--
-- Name: grades-history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."grades-history_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."grades-history_id_seq" OWNER TO postgres;

--
-- Name: grades-history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."grades-history_id_seq" OWNED BY public."grades-history".id;


--
-- Name: grades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.grades_id_seq OWNER TO postgres;

--
-- Name: grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.grades_id_seq OWNED BY public.grades.id;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    "orderNumber" character varying NOT NULL,
    "deletedOrderNumber" character varying,
    created timestamp with time zone DEFAULT now() NOT NULL,
    updated timestamp with time zone DEFAULT now() NOT NULL,
    "curatorId" integer,
    "voteId" integer
);


ALTER TABLE public.groups OWNER TO postgres;

--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.groups_id_seq OWNER TO postgres;

--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- Name: loggers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loggers (
    id integer NOT NULL,
    event character varying NOT NULL,
    before jsonb,
    after jsonb,
    entity character varying NOT NULL,
    "entityId" integer,
    created timestamp with time zone DEFAULT now() NOT NULL,
    updated timestamp with time zone DEFAULT now() NOT NULL,
    "userId" integer
);


ALTER TABLE public.loggers OWNER TO postgres;

--
-- Name: loggers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.loggers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.loggers_id_seq OWNER TO postgres;

--
-- Name: loggers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.loggers_id_seq OWNED BY public.loggers.id;


--
-- Name: migration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migration (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migration OWNER TO postgres;

--
-- Name: migration_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migration_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migration_id_seq OWNER TO postgres;

--
-- Name: migration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migration_id_seq OWNED BY public.migration.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    id integer NOT NULL,
    "dateOfBirth" character varying(10) NOT NULL,
    "orderNumber" character varying(20) NOT NULL,
    "edeboId" character varying(8) NOT NULL,
    "isFullTime" boolean NOT NULL,
    created timestamp with time zone DEFAULT now() NOT NULL,
    updated timestamp with time zone DEFAULT now() NOT NULL,
    "groupId" integer,
    "userId" integer,
    "voteId" integer
);


ALTER TABLE public.students OWNER TO postgres;

--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.students_id_seq OWNER TO postgres;

--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: typeorm_metadata; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.typeorm_metadata (
    type character varying NOT NULL,
    database character varying,
    schema character varying,
    "table" character varying,
    name character varying,
    value text
);


ALTER TABLE public.typeorm_metadata OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    "firstName" character varying(200),
    "lastName" character varying(200),
    email character varying(320),
    password character varying NOT NULL,
    role character varying DEFAULT 'student'::character varying NOT NULL,
    created timestamp with time zone DEFAULT now() NOT NULL,
    updated timestamp with time zone DEFAULT now() NOT NULL,
    "refreshTokenList" jsonb,
    patronymic character varying(200)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: voting; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.voting (
    id integer NOT NULL,
    "startDate" character varying,
    "endDate" character varying,
    "tookPart" integer DEFAULT 0 NOT NULL,
    status character varying,
    created timestamp with time zone DEFAULT now() NOT NULL,
    updated timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.voting OWNER TO postgres;

--
-- Name: voting_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.voting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.voting_id_seq OWNER TO postgres;

--
-- Name: voting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.voting_id_seq OWNED BY public.voting.id;


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: grades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades ALTER COLUMN id SET DEFAULT nextval('public.grades_id_seq'::regclass);


--
-- Name: grades-history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."grades-history" ALTER COLUMN id SET DEFAULT nextval('public."grades-history_id_seq"'::regclass);


--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- Name: loggers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loggers ALTER COLUMN id SET DEFAULT nextval('public.loggers_id_seq'::regclass);


--
-- Name: migration id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migration ALTER COLUMN id SET DEFAULT nextval('public.migration_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: voting id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voting ALTER COLUMN id SET DEFAULT nextval('public.voting_id_seq'::regclass);


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (id, name, credits, "lectureHours", "isActive", semester, "isCompulsory", "teacherId", "isExam", "gradeId", "voteRequiredCoursesId", "voteNotRequiredCoursesId", created, updated) FROM stdin;
2	English b1-2	15	48	t	1	f	3	f	30	\N	\N	2022-08-24 22:29:51.81277+02	2022-08-24 22:30:36.585035+02
3	English b1-3	15	48	t	1	f	3	f	30	\N	\N	2022-08-24 22:30:01.083867+02	2022-08-24 22:30:36.585035+02
4	English b1-5	15	48	t	1	f	3	f	30	\N	\N	2022-08-24 22:30:16.714045+02	2022-08-24 22:30:36.585035+02
5	English b1-6	15	48	t	1	f	3	f	30	\N	\N	2022-08-24 22:30:36.547179+02	2022-08-24 22:30:36.585035+02
1	English b1-1	15	48	t	1	f	3	f	30	\N	\N	2022-08-24 22:29:41.481969+02	2022-08-24 22:30:36.585035+02
\.


--
-- Data for Name: courses_groups_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses_groups_groups ("coursesId", "groupsId") FROM stdin;
1	1
1	2
2	2
2	3
3	3
3	4
4	5
4	6
5	7
5	8
\.


--
-- Data for Name: courses_students_students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses_students_students ("coursesId", "studentsId") FROM stdin;
1	1
1	2
1	3
1	4
1	5
2	1
2	2
2	3
2	4
2	5
3	1
3	2
3	3
3	4
3	5
4	1
4	2
4	3
4	4
4	5
5	1
5	2
5	3
5	4
5	5
\.


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grades (id, grade, "studentId", created, updated) FROM stdin;
1	0	1	2022-08-24 22:27:47.008519+02	2022-08-24 22:27:47.008519+02
2	0	2	2022-08-24 22:27:57.358929+02	2022-08-24 22:27:57.358929+02
3	0	3	2022-08-24 22:28:21.631845+02	2022-08-24 22:28:21.631845+02
4	0	4	2022-08-24 22:28:32.014782+02	2022-08-24 22:28:32.014782+02
5	0	5	2022-08-24 22:28:50.878282+02	2022-08-24 22:28:50.878282+02
6	0	1	2022-08-24 22:29:41.512356+02	2022-08-24 22:29:41.512356+02
7	0	3	2022-08-24 22:29:41.522064+02	2022-08-24 22:29:41.522064+02
8	0	5	2022-08-24 22:29:41.522567+02	2022-08-24 22:29:41.522567+02
9	0	4	2022-08-24 22:29:41.522809+02	2022-08-24 22:29:41.522809+02
10	0	2	2022-08-24 22:29:41.523535+02	2022-08-24 22:29:41.523535+02
11	0	1	2022-08-24 22:29:51.847987+02	2022-08-24 22:29:51.847987+02
12	0	2	2022-08-24 22:29:51.860808+02	2022-08-24 22:29:51.860808+02
13	0	3	2022-08-24 22:29:51.861382+02	2022-08-24 22:29:51.861382+02
14	0	5	2022-08-24 22:29:51.86175+02	2022-08-24 22:29:51.86175+02
15	0	4	2022-08-24 22:29:51.862344+02	2022-08-24 22:29:51.862344+02
16	0	1	2022-08-24 22:30:01.106418+02	2022-08-24 22:30:01.106418+02
17	0	2	2022-08-24 22:30:01.106806+02	2022-08-24 22:30:01.106806+02
18	0	3	2022-08-24 22:30:01.107562+02	2022-08-24 22:30:01.107562+02
19	0	4	2022-08-24 22:30:01.10827+02	2022-08-24 22:30:01.10827+02
20	0	5	2022-08-24 22:30:01.108655+02	2022-08-24 22:30:01.108655+02
21	0	1	2022-08-24 22:30:16.747525+02	2022-08-24 22:30:16.747525+02
22	0	2	2022-08-24 22:30:16.761505+02	2022-08-24 22:30:16.761505+02
23	0	3	2022-08-24 22:30:16.761859+02	2022-08-24 22:30:16.761859+02
24	0	4	2022-08-24 22:30:16.76228+02	2022-08-24 22:30:16.76228+02
25	0	5	2022-08-24 22:30:16.762758+02	2022-08-24 22:30:16.762758+02
26	0	1	2022-08-24 22:30:36.5685+02	2022-08-24 22:30:36.5685+02
27	0	2	2022-08-24 22:30:36.5822+02	2022-08-24 22:30:36.5822+02
28	0	3	2022-08-24 22:30:36.584104+02	2022-08-24 22:30:36.584104+02
29	0	4	2022-08-24 22:30:36.584623+02	2022-08-24 22:30:36.584623+02
30	0	5	2022-08-24 22:30:36.585035+02	2022-08-24 22:30:36.585035+02
\.


--
-- Data for Name: grades-history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."grades-history" (id, grade, "reasonOfChange", "createdAt", "updatedAt", "studentId", "courseId", "userChangedId") FROM stdin;
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groups (id, name, "orderNumber", "deletedOrderNumber", created, updated, "curatorId", "voteId") FROM stdin;
1	1П-21	123456	123456	2022-08-24 22:26:05.926787+02	2022-08-24 22:26:05.926787+02	2	\N
2	1П-23	123456	\N	2022-08-24 22:26:29.053336+02	2022-08-24 22:26:29.053336+02	2	\N
3	1П-24	123456	\N	2022-08-24 22:26:34.953516+02	2022-08-24 22:26:34.953516+02	2	\N
4	1П-25	123456	\N	2022-08-24 22:26:42.222476+02	2022-08-24 22:26:42.222476+02	2	\N
5	1П-26	123456	\N	2022-08-24 22:26:47.945785+02	2022-08-24 22:26:47.945785+02	2	\N
6	1П-27	123456	\N	2022-08-24 22:26:54.020213+02	2022-08-24 22:26:54.020213+02	2	\N
7	1П-28	123456	\N	2022-08-24 22:27:02.980717+02	2022-08-24 22:27:02.980717+02	2	\N
8	1П-29	123456	\N	2022-08-24 22:27:09.249311+02	2022-08-24 22:27:09.249311+02	2	\N
9	1П-30	123456	\N	2022-08-24 22:27:16.060654+02	2022-08-24 22:27:16.060654+02	2	\N
\.


--
-- Data for Name: loggers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loggers (id, event, before, after, entity, "entityId", created, updated, "userId") FROM stdin;
1	create	\N	{"id": 1, "role": "admin", "email": "admin@gmail.com", "lastName": "Huels", "firstName": "Earl"}	users	1	2022-08-24 22:24:43.506513+02	2022-08-24 22:24:43.506513+02	\N
2	create	\N	{"id": 2, "role": "curator", "email": "curator@gmail.com", "lastName": "Huels", "firstName": "Earl"}	users	2	2022-08-24 22:25:01.955259+02	2022-08-24 22:25:01.955259+02	\N
3	create	\N	{"id": 3, "role": "teacher", "email": "teacher@gmail.com", "lastName": "Huels", "firstName": "Earl"}	users	3	2022-08-24 22:25:33.58014+02	2022-08-24 22:25:33.58014+02	\N
4	create	\N	{"id": 1, "name": "1П-21", "created": "2022-08-24T20:26:05.926Z", "updated": "2022-08-24T20:26:05.926Z", "orderNumber": "123456"}	groups	1	2022-08-24 22:26:05.944226+02	2022-08-24 22:26:05.944226+02	1
5	create	\N	{"id": 2, "name": "1П-23", "created": "2022-08-24T20:26:29.053Z", "updated": "2022-08-24T20:26:29.053Z", "orderNumber": "123456"}	groups	2	2022-08-24 22:26:29.065778+02	2022-08-24 22:26:29.065778+02	1
6	create	\N	{"id": 3, "name": "1П-24", "created": "2022-08-24T20:26:34.953Z", "updated": "2022-08-24T20:26:34.953Z", "orderNumber": "123456"}	groups	3	2022-08-24 22:26:34.968039+02	2022-08-24 22:26:34.968039+02	1
7	create	\N	{"id": 4, "name": "1П-25", "created": "2022-08-24T20:26:42.222Z", "updated": "2022-08-24T20:26:42.222Z", "orderNumber": "123456"}	groups	4	2022-08-24 22:26:42.236546+02	2022-08-24 22:26:42.236546+02	1
8	create	\N	{"id": 5, "name": "1П-26", "created": "2022-08-24T20:26:47.945Z", "updated": "2022-08-24T20:26:47.945Z", "orderNumber": "123456"}	groups	5	2022-08-24 22:26:47.964626+02	2022-08-24 22:26:47.964626+02	1
9	create	\N	{"id": 6, "name": "1П-27", "created": "2022-08-24T20:26:54.020Z", "updated": "2022-08-24T20:26:54.020Z", "orderNumber": "123456"}	groups	6	2022-08-24 22:26:54.03169+02	2022-08-24 22:26:54.03169+02	1
10	create	\N	{"id": 7, "name": "1П-28", "created": "2022-08-24T20:27:02.980Z", "updated": "2022-08-24T20:27:02.980Z", "orderNumber": "123456"}	groups	7	2022-08-24 22:27:02.990933+02	2022-08-24 22:27:02.990933+02	1
11	create	\N	{"id": 8, "name": "1П-29", "created": "2022-08-24T20:27:09.249Z", "updated": "2022-08-24T20:27:09.249Z", "orderNumber": "123456"}	groups	8	2022-08-24 22:27:09.257269+02	2022-08-24 22:27:09.257269+02	1
12	create	\N	{"id": 9, "name": "1П-30", "created": "2022-08-24T20:27:16.060Z", "updated": "2022-08-24T20:27:16.060Z", "orderNumber": "123456"}	groups	9	2022-08-24 22:27:16.06726+02	2022-08-24 22:27:16.06726+02	1
13	create	\N	{"id": 4, "role": "student", "email": "Delmer671@hotmail.com", "lastName": "Carroll", "firstName": "Diego"}	users	4	2022-08-24 22:27:46.988411+02	2022-08-24 22:27:46.988411+02	1
14	create	\N	{"id": 1, "user": {"id": 4, "email": "Delmer671@hotmail.com", "lastName": "Carroll", "firstName": "Diego", "patronymic": "Diegovych"}, "group": {"id": 1, "name": "1П-21", "orderNumber": "123456"}, "edeboId": "11345678", "isFullTime": true, "orderNumber": "6724534082924"}	students	1	2022-08-24 22:27:47.007535+02	2022-08-24 22:27:47.007535+02	1
15	create	\N	{"id": 1, "grade": 0}	grades	1	2022-08-24 22:27:47.019988+02	2022-08-24 22:27:47.019988+02	1
16	create	\N	{"id": 5, "role": "student", "email": "Delmer6712@hotmail.com", "lastName": "Carroll", "firstName": "Diego"}	users	5	2022-08-24 22:27:57.330171+02	2022-08-24 22:27:57.330171+02	1
17	create	\N	{"id": 2, "user": {"id": 5, "email": "Delmer6712@hotmail.com", "lastName": "Carroll", "firstName": "Diego", "patronymic": "Diegovych"}, "group": {"id": 2, "name": "1П-23", "orderNumber": "123456"}, "edeboId": "11245678", "isFullTime": true, "orderNumber": "6724534082924"}	students	2	2022-08-24 22:27:57.357637+02	2022-08-24 22:27:57.357637+02	1
18	create	\N	{"id": 2, "grade": 0}	grades	2	2022-08-24 22:27:57.372558+02	2022-08-24 22:27:57.372558+02	1
19	create	\N	{"id": 6, "role": "student", "email": "Delmer6713@hotmail.com", "lastName": "Carroll", "firstName": "Diego"}	users	6	2022-08-24 22:28:21.620547+02	2022-08-24 22:28:21.620547+02	1
20	create	\N	{"id": 3, "user": {"id": 6, "email": "Delmer6713@hotmail.com", "lastName": "Carroll", "firstName": "Diego", "patronymic": "Diegovych"}, "group": {"id": 3, "name": "1П-24", "orderNumber": "123456"}, "edeboId": "11235678", "isFullTime": true, "orderNumber": "6724534082924"}	students	3	2022-08-24 22:28:21.645823+02	2022-08-24 22:28:21.645823+02	1
21	create	\N	{"id": 3, "grade": 0}	grades	3	2022-08-24 22:28:21.64823+02	2022-08-24 22:28:21.64823+02	1
22	create	\N	{"id": 7, "role": "student", "email": "Delmer67134@hotmail.com", "lastName": "Carroll", "firstName": "Diego"}	users	7	2022-08-24 22:28:31.987215+02	2022-08-24 22:28:31.987215+02	1
23	create	\N	{"id": 4, "user": {"id": 7, "email": "Delmer67134@hotmail.com", "lastName": "Carroll", "firstName": "Diego", "patronymic": "Diegovych"}, "group": {"id": 4, "name": "1П-25", "orderNumber": "123456"}, "edeboId": "11234678", "isFullTime": true, "orderNumber": "6724534082924"}	students	4	2022-08-24 22:28:32.009758+02	2022-08-24 22:28:32.009758+02	1
24	create	\N	{"id": 4, "grade": 0}	grades	4	2022-08-24 22:28:32.02597+02	2022-08-24 22:28:32.02597+02	1
25	create	\N	{"id": 8, "role": "student", "email": "Delmer671345@hotmail.com", "lastName": "Carroll", "firstName": "Diego"}	users	8	2022-08-24 22:28:50.862529+02	2022-08-24 22:28:50.862529+02	1
26	create	\N	{"id": 5, "user": {"id": 8, "email": "Delmer671345@hotmail.com", "lastName": "Carroll", "firstName": "Diego", "patronymic": "Diegovych"}, "group": {"id": 5, "name": "1П-26", "orderNumber": "123456"}, "edeboId": "11234675", "isFullTime": true, "orderNumber": "6724534082924"}	students	5	2022-08-24 22:28:50.884291+02	2022-08-24 22:28:50.884291+02	1
27	create	\N	{"id": 5, "grade": 0}	grades	5	2022-08-24 22:28:50.891869+02	2022-08-24 22:28:50.891869+02	1
28	create	\N	{"id": 1, "name": "English b1-1", "groups": [{"id": 1, "name": "1П-21", "orderNumber": "123456"}, {"id": 2, "name": "1П-23", "orderNumber": "123456"}], "credits": 15, "teacher": {"id": 3, "email": "teacher@gmail.com", "lastName": "Huels", "firstName": "Earl", "patronymic": "ivanovych"}, "isActive": true, "semester": 1, "isCompulsory": false, "lectureHours": 48}	courses	1	2022-08-24 22:29:41.513562+02	2022-08-24 22:29:41.513562+02	1
29	create	\N	{"id": 6, "grade": 0}	grades	6	2022-08-24 22:29:41.543494+02	2022-08-24 22:29:41.543494+02	1
30	create	\N	{"id": 8, "grade": 0}	grades	8	2022-08-24 22:29:41.549215+02	2022-08-24 22:29:41.549215+02	1
31	create	\N	{"id": 7, "grade": 0}	grades	7	2022-08-24 22:29:41.548383+02	2022-08-24 22:29:41.548383+02	1
32	create	\N	{"id": 9, "grade": 0}	grades	9	2022-08-24 22:29:41.560617+02	2022-08-24 22:29:41.560617+02	1
33	create	\N	{"id": 10, "grade": 0}	grades	10	2022-08-24 22:29:41.561773+02	2022-08-24 22:29:41.561773+02	1
34	create	\N	{"id": 2, "name": "English b1-2", "groups": [{"id": 2, "name": "1П-23", "orderNumber": "123456"}, {"id": 3, "name": "1П-24", "orderNumber": "123456"}], "credits": 15, "teacher": {"id": 3, "email": "teacher@gmail.com", "lastName": "Huels", "firstName": "Earl", "patronymic": "ivanovych"}, "isActive": true, "semester": 1, "isCompulsory": false, "lectureHours": 48}	courses	2	2022-08-24 22:29:51.837021+02	2022-08-24 22:29:51.837021+02	1
35	create	\N	{"id": 11, "grade": 0}	grades	11	2022-08-24 22:29:51.88056+02	2022-08-24 22:29:51.88056+02	1
36	create	\N	{"id": 12, "grade": 0}	grades	12	2022-08-24 22:29:51.894159+02	2022-08-24 22:29:51.894159+02	1
37	create	\N	{"id": 15, "grade": 0}	grades	15	2022-08-24 22:29:51.89764+02	2022-08-24 22:29:51.89764+02	1
38	create	\N	{"id": 13, "grade": 0}	grades	13	2022-08-24 22:29:51.903471+02	2022-08-24 22:29:51.903471+02	1
39	create	\N	{"id": 14, "grade": 0}	grades	14	2022-08-24 22:29:51.908412+02	2022-08-24 22:29:51.908412+02	1
40	create	\N	{"id": 3, "name": "English b1-3", "groups": [{"id": 3, "name": "1П-24", "orderNumber": "123456"}, {"id": 4, "name": "1П-25", "orderNumber": "123456"}], "credits": 15, "teacher": {"id": 3, "email": "teacher@gmail.com", "lastName": "Huels", "firstName": "Earl", "patronymic": "ivanovych"}, "isActive": true, "semester": 1, "isCompulsory": false, "lectureHours": 48}	courses	3	2022-08-24 22:30:01.095869+02	2022-08-24 22:30:01.095869+02	1
41	create	\N	{"id": 16, "grade": 0}	grades	16	2022-08-24 22:30:01.140072+02	2022-08-24 22:30:01.140072+02	1
42	create	\N	{"id": 17, "grade": 0}	grades	17	2022-08-24 22:30:01.146917+02	2022-08-24 22:30:01.146917+02	1
43	create	\N	{"id": 18, "grade": 0}	grades	18	2022-08-24 22:30:01.153739+02	2022-08-24 22:30:01.153739+02	1
44	create	\N	{"id": 19, "grade": 0}	grades	19	2022-08-24 22:30:01.160274+02	2022-08-24 22:30:01.160274+02	1
45	create	\N	{"id": 20, "grade": 0}	grades	20	2022-08-24 22:30:01.166531+02	2022-08-24 22:30:01.166531+02	1
46	create	\N	{"id": 4, "name": "English b1-5", "groups": [{"id": 5, "name": "1П-26", "orderNumber": "123456"}, {"id": 6, "name": "1П-27", "orderNumber": "123456"}], "credits": 15, "teacher": {"id": 3, "email": "teacher@gmail.com", "lastName": "Huels", "firstName": "Earl", "patronymic": "ivanovych"}, "isActive": true, "semester": 1, "isCompulsory": false, "lectureHours": 48}	courses	4	2022-08-24 22:30:16.739207+02	2022-08-24 22:30:16.739207+02	1
47	create	\N	{"id": 21, "grade": 0}	grades	21	2022-08-24 22:30:16.792197+02	2022-08-24 22:30:16.792197+02	1
48	create	\N	{"id": 22, "grade": 0}	grades	22	2022-08-24 22:30:16.798631+02	2022-08-24 22:30:16.798631+02	1
49	create	\N	{"id": 23, "grade": 0}	grades	23	2022-08-24 22:30:16.804215+02	2022-08-24 22:30:16.804215+02	1
50	create	\N	{"id": 24, "grade": 0}	grades	24	2022-08-24 22:30:16.810576+02	2022-08-24 22:30:16.810576+02	1
51	create	\N	{"id": 25, "grade": 0}	grades	25	2022-08-24 22:30:16.816977+02	2022-08-24 22:30:16.816977+02	1
52	create	\N	{"id": 5, "name": "English b1-6", "groups": [{"id": 7, "name": "1П-28", "orderNumber": "123456"}, {"id": 8, "name": "1П-29", "orderNumber": "123456"}], "credits": 15, "teacher": {"id": 3, "email": "teacher@gmail.com", "lastName": "Huels", "firstName": "Earl", "patronymic": "ivanovych"}, "isActive": true, "semester": 1, "isCompulsory": false, "lectureHours": 48}	courses	5	2022-08-24 22:30:36.570473+02	2022-08-24 22:30:36.570473+02	1
53	create	\N	{"id": 26, "grade": 0}	grades	26	2022-08-24 22:30:36.607742+02	2022-08-24 22:30:36.607742+02	1
54	create	\N	{"id": 27, "grade": 0}	grades	27	2022-08-24 22:30:36.613577+02	2022-08-24 22:30:36.613577+02	1
55	create	\N	{"id": 28, "grade": 0}	grades	28	2022-08-24 22:30:36.61966+02	2022-08-24 22:30:36.61966+02	1
56	create	\N	{"id": 29, "grade": 0}	grades	29	2022-08-24 22:30:36.626159+02	2022-08-24 22:30:36.626159+02	1
57	create	\N	{"id": 30, "grade": 0}	grades	30	2022-08-24 22:30:36.632738+02	2022-08-24 22:30:36.632738+02	1
\.


--
-- Data for Name: migration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migration (id, "timestamp", name) FROM stdin;
1	1653160550623	init1653160550623
2	1653756940669	students1653756940669
3	1654071726480	groups1654071726480
4	1654095038754	fix1654095038754
5	1655910162044	addPatronymic1655910162044
6	1656350173065	course1656350173065
7	1656696205400	grades1656696205400
8	1658326580796	addIsExamToCourses1658326580796
9	1659123451206	fixUserDelete1659123451206
10	1659296627344	fixBug1659296627344
11	1659610409847	fixBugWithUserDelete1659610409847
12	1660285462299	fixDelete1660285462299
13	1660395167774	fixGetAllCourses1660395167774
14	1660466812744	createVoting1660466812744
15	1660473925720	createVoting21660473925720
16	1660489046615	createVoting31660489046615
17	1660633126451	addedGroupsToVoting1660633126451
18	1660847791117	gradesHistoryCollection1660847791117
19	1660901285518	addedColumsToCourses1660901285518
20	1660901799153	addedColumsToGrades1660901799153
21	1660917855605	addedRelationsToVoting1660917855605
22	1660923708079	addSemesterToVoting1660923708079
23	1661162626905	removedSemesterFromVoting1661162626905
24	1661164464112	fixRelations1661164464112
25	1661184826176	addedColumnsToVoting1661184826176
26	1661189392444	fixCoursesGradesRelationManyToMany1661189392444
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (id, "dateOfBirth", "orderNumber", "edeboId", "isFullTime", created, updated, "groupId", "userId", "voteId") FROM stdin;
1	15.03.2002	6724534082924	11345678	t	2022-08-24 22:27:46.9965+02	2022-08-24 22:27:46.9965+02	1	4	\N
2	15.03.2002	6724534082924	11245678	t	2022-08-24 22:27:57.344563+02	2022-08-24 22:27:57.344563+02	2	5	\N
3	15.03.2002	6724534082924	11235678	t	2022-08-24 22:28:21.621263+02	2022-08-24 22:28:21.621263+02	3	6	\N
4	15.03.2002	6724534082924	11234678	t	2022-08-24 22:28:31.997737+02	2022-08-24 22:28:31.997737+02	4	7	\N
5	15.03.2002	6724534082924	11234675	t	2022-08-24 22:28:50.864303+02	2022-08-24 22:28:50.864303+02	5	8	\N
\.


--
-- Data for Name: typeorm_metadata; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.typeorm_metadata (type, database, schema, "table", name, value) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, "firstName", "lastName", email, password, role, created, updated, "refreshTokenList", patronymic) FROM stdin;
1	Earl	Huels	admin@gmail.com	$2b$10$WFsnJHwCXXh8aQduy9ncHOcw4/CIhN75ZM0m6ZbdbmSKjDdI14n/K	admin	2022-08-24 22:24:43.423633+02	2022-08-24 22:24:43.512568+02	[{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJlZnJlc2giOnRydWUsImlhdCI6MTY2MTM3MjY4MywiZXhwIjoxNjY0MDUxMDgzfQ.JN5YU6XjFNShKGnYD4E4kl6bvfRE7gAUhh1UNgBMAxY", "expiresIn": "2022-09-24T20:24:43.507Z"}]	ivanovych
2	Earl	Huels	curator@gmail.com	$2b$10$1FSTU0wm12nDcsmLFIwGs.nPAcAUFkr78yZbaUSMZQArQEHFk/L5K	curator	2022-08-24 22:25:01.842652+02	2022-08-24 22:25:01.969121+02	[{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInJlZnJlc2giOnRydWUsImlhdCI6MTY2MTM3MjcwMSwiZXhwIjoxNjY0MDUxMTAxfQ.zZJWHrwYx_YC_8Pgr_vbKa6eFPaTcySquWtXD87oxDg", "expiresIn": "2022-09-24T20:25:01.966Z"}]	ivanovych
3	Earl	Huels	teacher@gmail.com	$2b$10$rgJlw1aaDaRtieI6f2kn4eJpyD4kB/ZHkzezbJLc0j3vn8tRzOBpe	teacher	2022-08-24 22:25:33.518233+02	2022-08-24 22:25:33.590249+02	[{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsInJlZnJlc2giOnRydWUsImlhdCI6MTY2MTM3MjczMywiZXhwIjoxNjY0MDUxMTMzfQ.Iiq8-CFE8zOtrdyLTfozbzx7s3ZaCDvpsVpShLY_Sc0", "expiresIn": "2022-09-24T20:25:33.588Z"}]	ivanovych
4	Diego	Carroll	Delmer671@hotmail.com	$2b$10$cbH92rrn1YyG7NQvDybSaueAWIKxxIs0pqfuqciPuZa/MIEWItqhO	student	2022-08-24 22:27:46.873651+02	2022-08-24 22:27:46.873651+02	\N	Diegovych
5	Diego	Carroll	Delmer6712@hotmail.com	$2b$10$zSSvVo917uuovJcPLTIhK.Mbw0zTqKMUB2v5AbE5755w9wjjmMLeq	student	2022-08-24 22:27:57.245183+02	2022-08-24 22:27:57.245183+02	\N	Diegovych
6	Diego	Carroll	Delmer6713@hotmail.com	$2b$10$6lFec4RgDhgXgrtphnEZCe9M2AtLVyywQZP1OK36A2tgD/YlXSWpi	student	2022-08-24 22:28:21.55747+02	2022-08-24 22:28:21.55747+02	\N	Diegovych
7	Diego	Carroll	Delmer67134@hotmail.com	$2b$10$wRXAcxeGmmspV8cHurn72edY4krHPyKUc.gJK6H1i3IESpXYkpd8q	student	2022-08-24 22:28:31.875559+02	2022-08-24 22:28:31.875559+02	\N	Diegovych
8	Diego	Carroll	Delmer671345@hotmail.com	$2b$10$aGFI.FUCIyO7tLLSKm8FQ.Zzuw3k7XI8NossGZaoa9T6FHQxPnKqu	student	2022-08-24 22:28:50.781849+02	2022-08-24 22:28:50.781849+02	\N	Diegovych
\.


--
-- Data for Name: voting; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.voting (id, "startDate", "endDate", "tookPart", status, created, updated) FROM stdin;
\.


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.courses_id_seq', 5, true);


--
-- Name: grades-history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."grades-history_id_seq"', 1, false);


--
-- Name: grades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grades_id_seq', 30, true);


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.groups_id_seq', 9, true);


--
-- Name: loggers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.loggers_id_seq', 57, true);


--
-- Name: migration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migration_id_seq', 26, true);


--
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.students_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- Name: voting_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.voting_id_seq', 1, false);


--
-- Name: loggers PK_29e8f8af58645b7a782e3694a1a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loggers
    ADD CONSTRAINT "PK_29e8f8af58645b7a782e3694a1a" PRIMARY KEY (id);


--
-- Name: voting PK_2dff1e5c53fa2cc610bea30476c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voting
    ADD CONSTRAINT "PK_2dff1e5c53fa2cc610bea30476c" PRIMARY KEY (id);


--
-- Name: migration PK_3043fc6b8af7c99b8b98830094f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migration
    ADD CONSTRAINT "PK_3043fc6b8af7c99b8b98830094f" PRIMARY KEY (id);


--
-- Name: courses PK_3f70a487cc718ad8eda4e6d58c9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY (id);


--
-- Name: grades PK_4740fb6f5df2505a48649f1687b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT "PK_4740fb6f5df2505a48649f1687b" PRIMARY KEY (id);


--
-- Name: groups PK_659d1483316afb28afd3a90646e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY (id);


--
-- Name: grades-history PK_6c3c719eed8a493993ae587b3b3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."grades-history"
    ADD CONSTRAINT "PK_6c3c719eed8a493993ae587b3b3" PRIMARY KEY (id);


--
-- Name: students PK_7d7f07271ad4ce999880713f05e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY (id);


--
-- Name: courses_groups_groups PK_99f8b786e4bb8d2684bc32f14dd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses_groups_groups
    ADD CONSTRAINT "PK_99f8b786e4bb8d2684bc32f14dd" PRIMARY KEY ("coursesId", "groupsId");


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: courses_students_students PK_cd841c434866a6504aec6bca47c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses_students_students
    ADD CONSTRAINT "PK_cd841c434866a6504aec6bca47c" PRIMARY KEY ("coursesId", "studentsId");


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: students UQ_e0208b4f964e609959aff431bf9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "UQ_e0208b4f964e609959aff431bf9" UNIQUE ("userId");


--
-- Name: IDX_6240c191ac91418ffb0891e94c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6240c191ac91418ffb0891e94c" ON public.courses_students_students USING btree ("studentsId");


--
-- Name: IDX_c5e50aae84c2361359ea56909a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c5e50aae84c2361359ea56909a" ON public.courses_groups_groups USING btree ("coursesId");


--
-- Name: IDX_d36a578873f217fce8345f5f67; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d36a578873f217fce8345f5f67" ON public.courses_groups_groups USING btree ("groupsId");


--
-- Name: IDX_dffd4341c3ac7907af894f52e1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dffd4341c3ac7907af894f52e1" ON public.courses_students_students USING btree ("coursesId");


--
-- Name: loggers FK_116fa0216ec2e36c943ca2107f0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loggers
    ADD CONSTRAINT "FK_116fa0216ec2e36c943ca2107f0" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: grades-history FK_3f1ebc518e8044040df84641d9f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."grades-history"
    ADD CONSTRAINT "FK_3f1ebc518e8044040df84641d9f" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: courses FK_4c15ba07f47bb96db79f91c2d7d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "FK_4c15ba07f47bb96db79f91c2d7d" FOREIGN KEY ("voteNotRequiredCoursesId") REFERENCES public.voting(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: groups FK_51cee3d0c9b68a43e8b38b89a75; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "FK_51cee3d0c9b68a43e8b38b89a75" FOREIGN KEY ("voteId") REFERENCES public.voting(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: courses_students_students FK_6240c191ac91418ffb0891e94c5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses_students_students
    ADD CONSTRAINT "FK_6240c191ac91418ffb0891e94c5" FOREIGN KEY ("studentsId") REFERENCES public.students(id) ON DELETE SET NULL;


--
-- Name: grades-history FK_649d9476e287977d1d6ffe8a37d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."grades-history"
    ADD CONSTRAINT "FK_649d9476e287977d1d6ffe8a37d" FOREIGN KEY ("userChangedId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: students FK_6d8620a3b447dc4f2c1a08e0a92; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_6d8620a3b447dc4f2c1a08e0a92" FOREIGN KEY ("voteId") REFERENCES public.voting(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: courses_groups_groups FK_c5e50aae84c2361359ea56909a6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses_groups_groups
    ADD CONSTRAINT "FK_c5e50aae84c2361359ea56909a6" FOREIGN KEY ("coursesId") REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: students FK_cc296de36cadf8de53b9cd60aa7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_cc296de36cadf8de53b9cd60aa7" FOREIGN KEY ("groupId") REFERENCES public.groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: courses FK_d03709a9095936a8fc94fa08008; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "FK_d03709a9095936a8fc94fa08008" FOREIGN KEY ("gradeId") REFERENCES public.grades(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: courses_groups_groups FK_d36a578873f217fce8345f5f67f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses_groups_groups
    ADD CONSTRAINT "FK_d36a578873f217fce8345f5f67f" FOREIGN KEY ("groupsId") REFERENCES public.groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: courses FK_d456c22061e86f1339e256f2d34; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "FK_d456c22061e86f1339e256f2d34" FOREIGN KEY ("voteRequiredCoursesId") REFERENCES public.voting(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: grades-history FK_d8d226f5484c891cf586cd33116; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."grades-history"
    ADD CONSTRAINT "FK_d8d226f5484c891cf586cd33116" FOREIGN KEY ("courseId") REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: courses_students_students FK_dffd4341c3ac7907af894f52e16; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses_students_students
    ADD CONSTRAINT "FK_dffd4341c3ac7907af894f52e16" FOREIGN KEY ("coursesId") REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: students FK_e0208b4f964e609959aff431bf9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_e0208b4f964e609959aff431bf9" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: groups FK_e805347954b6a54c7d3a8ea2a18; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "FK_e805347954b6a54c7d3a8ea2a18" FOREIGN KEY ("curatorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: courses FK_f921bd9bb6d061b90d386fa3721; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "FK_f921bd9bb6d061b90d386fa3721" FOREIGN KEY ("teacherId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: grades FK_fcfc027e4e5fb37a4372e688070; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT "FK_fcfc027e4e5fb37a4372e688070" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

