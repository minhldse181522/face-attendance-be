import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class FormSeedService implements OnModuleInit {
  private readonly logger = new Logger(FormSeedService.name);

  async onModuleInit() {
    await this.seedForms();
  }

  private async seedForms() {
    this.logger.log('Starting form seeding...');
    const rawPrisma = new PrismaClient();

    const formsToSeed = [
      {
        id: '1',
        title: 'Đơn vắng mặt',
        description:
          'Đơn vắng mặt phát sinh khi bạn có nhu cầu vắng mặt 1 khoảng thời gian trong ca làm việc.',
        roleCode: 'R2',
        createdBy: 'SYSTEM',
      },
      {
        id: '2',
        title: 'Đơn tăng ca',
        description:
          'Đơn tăng ca phát sinh khi bạn có khoảng thời gian làm thêm không nằm trong ca làm việc.',
        roleCode: 'R2',
        createdBy: 'SYSTEM',
      },
      {
        id: '3',
        title: 'Đơn quên chấm công',
        description:
          'Đơn quên chấm công phát sinh khi bạn quên chấm công khi đến.',
        roleCode: 'R2',
        createdBy: 'SYSTEM',
      },
      {
        id: '4',
        title: 'Đơn thôi việc',
        description: 'Đơn thôi việc phát sinh khi bạn nghỉ việc.',
        roleCode: 'R3',
        createdBy: 'SYSTEM',
      },
      {
        id: '5',
        title: 'Đơn xác thực khuôn mặt',
        description: 'Đơn xác thực khuôn mặt.',
        roleCode: 'R2',
        createdBy: 'SYSTEM',
      },
      {
        id: '6',
        title: 'Đơn khác',
        description: 'Đơn phát sinh các báo cáo lương, hay vấn đề khác ...',
        roleCode: 'R2',
        createdBy: 'SYSTEM',
      },
    ];

    for (const formData of formsToSeed) {
      try {
        // Check if form already exists
        const formId = BigInt(formData.id);
        const exists = await rawPrisma.form.findUnique({
          where: { id: formId },
        });

        if (!exists) {
          await rawPrisma.form.create({
            data: {
              id: formId,
              title: formData.title,
              description: formData.description,
              roleCode: formData.roleCode,
              createdBy: formData.createdBy,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          this.logger.log(
            `Created form: ${formData.title} (ID: ${formData.id})`,
          );
        } else {
          this.logger.log(
            `Form already exists: ${formData.title} (ID: ${formData.id})`,
          );
        }
      } catch (error) {
        this.logger.error(`Failed to create form ${formData.title}:`, error);
      }
    }

    await rawPrisma.$disconnect(); // đừng quên đóng kết nối
    this.logger.log('Form seeding completed');
  }
}
