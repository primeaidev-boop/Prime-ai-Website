import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseLevel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdateCourseHeroDto,
  UpdateWhoItemsDto,
  UpdateModulesDto,
  UpdateToolsDto,
  UpdateOutcomesDto,
  UpdateBeforeAfterDto,
  UpdateEligibilityDto,
  UpdateFaqsDto,
  UpdateTestimonialsDto,
  UpdateListingPageDto,
  UpdateListingWhoCardsDto,
} from './dto/update-course.dto';

const LEVEL_SLUG_MAP: Record<string, CourseLevel> = {
  l1: CourseLevel.L1_FOUNDATION,
  l2a: CourseLevel.L2A_GENERALIST,
  l2b: CourseLevel.L2B_DEVELOPER,
  aiml: CourseLevel.L3_AIML,
};

const COURSE_INCLUDE = {
  whoItems: { orderBy: { order: 'asc' as const } },
  modules: { orderBy: { order: 'asc' as const } },
  tools: { orderBy: { order: 'asc' as const } },
  outcomes: { orderBy: { order: 'asc' as const } },
  beforeAfter: true,
  eligibilityItems: { orderBy: { order: 'asc' as const } },
  faqs: { orderBy: { order: 'asc' as const } },
  testimonials: { orderBy: { order: 'asc' as const } },
};

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.aiCourse.findMany({
      include: COURSE_INCLUDE,
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const level = LEVEL_SLUG_MAP[slug.toLowerCase()];
    if (!level) throw new NotFoundException(`Course '${slug}' not found`);
    const course = await this.prisma.aiCourse.findUnique({
      where: { level },
      include: COURSE_INCLUDE,
    });
    if (!course) throw new NotFoundException(`Course '${slug}' not found`);
    return course;
  }

  async updateHero(slug: string, dto: UpdateCourseHeroDto) {
    const course = await this.findBySlug(slug);
    return this.prisma.aiCourse.update({
      where: { id: course.id },
      data: dto,
      include: COURSE_INCLUDE,
    });
  }

  async updateWhoItems(slug: string, dto: UpdateWhoItemsDto) {
    const course = await this.findBySlug(slug);
    await this.prisma.courseWhoItem.deleteMany({ where: { courseId: course.id } });
    await this.prisma.courseWhoItem.createMany({
      data: dto.items.map((item) => ({ ...item, courseId: course.id })),
    });
    return this.findBySlug(slug);
  }

  async updateModules(slug: string, dto: UpdateModulesDto) {
    const course = await this.findBySlug(slug);
    await this.prisma.courseModule.deleteMany({ where: { courseId: course.id } });
    await this.prisma.courseModule.createMany({
      data: dto.items.map((item) => ({ ...item, courseId: course.id })),
    });
    return this.findBySlug(slug);
  }

  async updateTools(slug: string, dto: UpdateToolsDto) {
    const course = await this.findBySlug(slug);
    await this.prisma.courseTool.deleteMany({ where: { courseId: course.id } });
    await this.prisma.courseTool.createMany({
      data: dto.items.map((item) => ({ ...item, courseId: course.id })),
    });
    return this.findBySlug(slug);
  }

  async updateOutcomes(slug: string, dto: UpdateOutcomesDto) {
    const course = await this.findBySlug(slug);
    await this.prisma.courseOutcome.deleteMany({ where: { courseId: course.id } });
    await this.prisma.courseOutcome.createMany({
      data: dto.items.map((item) => ({ ...item, courseId: course.id })),
    });
    return this.findBySlug(slug);
  }

  async updateBeforeAfter(slug: string, dto: UpdateBeforeAfterDto) {
    const course = await this.findBySlug(slug);
    await this.prisma.courseBeforeAfter.upsert({
      where: { courseId: course.id },
      update: dto,
      create: { ...dto, courseId: course.id },
    });
    return this.findBySlug(slug);
  }

  async updateEligibility(slug: string, dto: UpdateEligibilityDto) {
    const course = await this.findBySlug(slug);
    await this.prisma.courseEligibilityItem.deleteMany({ where: { courseId: course.id } });
    await this.prisma.courseEligibilityItem.createMany({
      data: dto.items.map((item) => ({ ...item, courseId: course.id })),
    });
    return this.findBySlug(slug);
  }

  async updateFaqs(slug: string, dto: UpdateFaqsDto) {
    const course = await this.findBySlug(slug);
    await this.prisma.courseFAQ.deleteMany({ where: { courseId: course.id } });
    await this.prisma.courseFAQ.createMany({
      data: dto.items.map((item) => ({ ...item, courseId: course.id })),
    });
    return this.findBySlug(slug);
  }

  async updateTestimonials(slug: string, dto: UpdateTestimonialsDto) {
    const course = await this.findBySlug(slug);
    await this.prisma.courseTestimonial.deleteMany({ where: { courseId: course.id } });
    await this.prisma.courseTestimonial.createMany({
      data: dto.items.map((item) => ({ ...item, courseId: course.id })),
    });
    return this.findBySlug(slug);
  }

  // ─── Listing Page (singleton) ────────────────────────────────────────────────

  private listingPageInclude = {
    whoCards: { orderBy: { order: 'asc' as const } },
  };

  async findListingPage() {
    const page = await this.prisma.coursesListingPage.findFirst({
      include: this.listingPageInclude,
    });
    if (!page) throw new NotFoundException('Courses listing page not found');
    return page;
  }

  async updateListingPage(dto: UpdateListingPageDto) {
    const page = await this.findListingPage();
    return this.prisma.coursesListingPage.update({
      where: { id: page.id },
      data: dto,
      include: this.listingPageInclude,
    });
  }

  async updateListingWhoCards(dto: UpdateListingWhoCardsDto) {
    const page = await this.findListingPage();
    await this.prisma.coursesListingWhoCard.deleteMany({ where: { pageId: page.id } });
    await this.prisma.coursesListingWhoCard.createMany({
      data: dto.items.map((item) => ({ ...item, pageId: page.id })),
    });
    return this.findListingPage();
  }
}
