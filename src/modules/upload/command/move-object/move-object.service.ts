import { CommandHandler } from '@nestjs/cqrs';
import { minioConfig } from '@src/configs/minio.config';
import { MinioService } from '@src/libs/minio/minio.service';
import { MoveObjectCommand } from './move-object.command';
import { MoveObjectResponseDto } from './move-object.response.dto';

@CommandHandler(MoveObjectCommand)
export class MoveObjectService {
  constructor(private readonly minIoService: MinioService) {}

  async execute(command: MoveObjectCommand): Promise<MoveObjectResponseDto[]> {
    // chỉ thay đổi các mặt all, detail kèm theo com, loc, dam, rep, length, width, quantity, các thông tin còn lại không thay đổi
    const bucketName = minioConfig.bucketName;
    // await this.minIoService.checkOrCreateBucket();

    // const minioHostGetImage = this.minIoService.getPublicEndpoint();

    const results: MoveObjectResponseDto[] = [];
    const information = command.information;

    /*
    lấy lại path cũ, path cũ có 2 dạng
      _ nếu loại tác nghiệp jobTask == 'getin': TEMU8121621_CONT123456/getin/survey_0/MOM505x20cm.HWR.TX7N.DT.RP.150.100.2/TEMU8121621_2.jpg
                                              : TEMU8121621_CONT123456/getin/survey_0/all/TEMU8121621_1.jpg
      _ nếu loại tác nghiệp jobTask == 'getout': TEMU8121621_CONT123456/getout/HWR.TX7N.DT.RP.150.100.2/TEMU8121621_2.jpg
                                               : TEMU8121621_CONT123456/getout/all/TEMU8121621_1.jpg
    */
    const splitOldPath = information.map((item) => {
      return item.oldPath.split('/');
    });
    for (let i = 0; i < splitOldPath.length; i++) {
      const contNoAndIdCont = splitOldPath[i][0]; // TEMU8121621_CONT123456
      const jobTask = splitOldPath[i][1]; // getin hoặc getout
      // nếu loại tác nghiệp jobTask == 'getin'
      if (jobTask == 'getin') {
        const surveyTypeAndSeq = splitOldPath[i][2]; // survey_0
        const side = splitOldPath[i][3]; // all hoặc damDescription.com.loc.dam.rep.length.width.quantity
        const imageName = splitOldPath[i][4]; // TEMU8121621_1.jpg

        // nếu ảnh đang ở mặt all => chỉ có 1 TH: chuyển từ all sang detail
        if (side == 'all') {
          if (command.newSide == 'all') {
            return Promise.reject(
              new Error('Ảnh đã ở mặt cần chuyển, hãy chọn mặt khác'),
            );
          }
          const newDamDescription = information[i].newDamDescription || '-';
          const newCom = information[i].newCom || '-';
          const newLoc = information[i].newLoc || '-';
          const newDam = information[i].newDam || '-';
          const newRep = information[i].newRep || '-';
          const newLength = information[i].newLength || '-';
          const newWidth = information[i].newWidth || '-';
          const newQuantity = information[i].newQuantity || '-';

          const newPath = [
            contNoAndIdCont,
            jobTask,
            surveyTypeAndSeq,
            `${newDamDescription}.${newCom}.${newLoc}.${newDam}.${newRep}.${newLength}.${newWidth}.${newQuantity}`,
            imageName,
          ].join('/');

          await this.minIoService.publicUrl();
          await this.minIoService.move(information[i].oldPath, newPath);

          results.push({
            oldUrl: '',
            newUrl: '',
            // oldUrl: `${minioHostGetImage}/${bucketName}/${information[i].oldPath}`,
            // newUrl: `${minioHostGetImage}/${bucketName}/${newPath}`,
          });
        }
        // nếu ảnh đang ở mặt detail => có 2 TH: chuyển ra all hoặc chuyển sang mặt detail khác
        else {
          // TH1: chuyển sang mặt all
          if (command.newSide == 'all') {
            const newPath = [
              contNoAndIdCont,
              jobTask,
              surveyTypeAndSeq,
              command.newSide,
              imageName,
            ].join('/');

            await this.minIoService.publicUrl();
            await this.minIoService.move(information[i].oldPath, newPath);

            results.push({
              oldUrl: '',
              newUrl: '',
              // oldUrl: `${minioHostGetImage}/${bucketName}/${information[i].oldPath}`,
              // newUrl: `${minioHostGetImage}/${bucketName}/${newPath}`,
            });
          }
          // TH2: chuyển sang mặt detail khác
          else {
            // tách side detail cũ ra để lấy lại các damDescription, com, loc, dam, rep, length, width, quantity cũ
            const splitSide = side.split('.'); // damDescription.com.loc.dam.rep.length.width.quantity

            // nếu damDescription, com, loc, dam, rep, length, width, quantity cũ đồng thời giống com, loc, dam, rep, length, width, quantity mới => error
            if (
              information[i].newDamDescription == splitSide[0] &&
              information[i].newCom == splitSide[1] &&
              information[i].newLoc == splitSide[2] &&
              information[i].newDam == splitSide[2] &&
              information[i].newRep == splitSide[4] &&
              information[i].newLength == splitSide[5] &&
              information[i].newWidth == splitSide[6] &&
              information[i].newQuantity == splitSide[7]
            ) {
              return Promise.reject(
                new Error('Ảnh đã ở mặt cần chuyển, hãy chọn mặt khác'),
              );
            }
            const newDamDescription = information[i].newDamDescription || '-';
            const newCom = information[i].newCom || '-';
            const newLoc = information[i].newLoc || '-';
            const newDam = information[i].newDam || '-';
            const newRep = information[i].newRep || '-';
            const newLength = information[i].newLength || '-';
            const newWidth = information[i].newWidth || '-';
            const newQuantity = information[i].newQuantity || '-';

            const newPath = [
              contNoAndIdCont,
              jobTask,
              surveyTypeAndSeq,
              `${newDamDescription}.${newCom}.${newLoc}.${newDam}.${newRep}.${newLength}.${newWidth}.${newQuantity}`,
              imageName,
            ].join('/');

            await this.minIoService.publicUrl();
            await this.minIoService.move(information[i].oldPath, newPath);

            results.push({
              oldUrl: '',
              newUrl: '',
              // oldUrl: `${minioHostGetImage}/${bucketName}/${information[i].oldPath}`,
              // newUrl: `${minioHostGetImage}/${bucketName}/${newPath}`,
            });
          }
        }
      }

      // nếu loại tác nghiệp jobTask == 'getout'
      else if (jobTask == 'getout') {
        const side = splitOldPath[i][2]; // all, in hoặc out
        const imageName = splitOldPath[i][3]; // TEMU8121621_1.jpg

        // nếu ảnh đang ở mặt all => chỉ có 1 TH: chuyển từ all (không có com loc rep) sang in hoặc out (có com loc rep)
        if (side == 'all') {
          if (command.newSide == 'all') {
            return Promise.reject(
              new Error('Ảnh đã ở mặt cần chuyển, hãy chọn mặt khác'),
            );
          }
          if (
            !information[i].newCom ||
            !information[i].newRep ||
            !information[i].newQuantity
          ) {
            return Promise.reject(
              new Error(
                'com, rep, quantity không được để trống khi chọn side là detail',
              ),
            );
          }
          const newLoc = information[i].newLoc || '-';
          const newDam = information[i].newDam || '-';
          const newLength = information[i].newLength || '-';
          const newWidth = information[i].newWidth || '-';

          const newPath = [
            contNoAndIdCont,
            jobTask,
            `${information[i].newCom}.${newLoc}.${newDam}.${information[i].newRep}.${newLength}.${newWidth}.${information[i].newQuantity}`,
            imageName,
          ].join('/');

          await this.minIoService.publicUrl();
          await this.minIoService.move(information[i].oldPath, newPath);

          results.push({
            oldUrl: '',
            newUrl: '',
            // oldUrl: `${minioHostGetImage}/${bucketName}/${information[i].oldPath}`,
            // newUrl: `${minioHostGetImage}/${bucketName}/${newPath}`,
          });
        }
        // nếu ảnh đang ở mặt detail => có 2 TH: chuyển ra all hoặc chuyển sang mặt detail khác
        else {
          // TH1: chuyển sang mặt all
          if (command.newSide == 'all') {
            const newPath = [
              contNoAndIdCont,
              jobTask,
              command.newSide,
              imageName,
            ].join('/');

            await this.minIoService.publicUrl();
            await this.minIoService.move(information[i].oldPath, newPath);

            results.push({
              oldUrl: '',
              newUrl: '',
              // oldUrl: `${minioHostGetImage}/${bucketName}/${information[i].oldPath}`,
              // newUrl: `${minioHostGetImage}/${bucketName}/${newPath}`,
            });
          }
          // TH2: chuyển sang mặt detail khác
          else {
            // tách side detail cũ ra để lấy lại các com, loc, dam, rep, length, width, quantity cũ
            const splitSide = side.split('.'); // com.loc.dam.rep.length.width.quantity

            if (
              !information[i].newCom ||
              !information[i].newRep ||
              !information[i].newQuantity
            ) {
              return Promise.reject(
                new Error(
                  'com, rep, quantity không được để trống khi chọn side là detail',
                ),
              );
            }

            // nếu com, loc, dam, rep, length, width, quantity cũ đồng thời giống com, loc, dam, rep, length, width, quantity mới => error
            if (
              information[i].newCom == splitSide[0] &&
              information[i].newLoc == splitSide[1] &&
              information[i].newDam == splitSide[2] &&
              information[i].newRep == splitSide[3] &&
              information[i].newLength == splitSide[4] &&
              information[i].newWidth == splitSide[5] &&
              information[i].newQuantity == splitSide[6]
            ) {
              return Promise.reject(
                new Error('Ảnh đã ở mặt cần chuyển, hãy chọn mặt khác'),
              );
            }

            const newLoc = information[i].newLoc || '-';
            const newDam = information[i].newDam || '-';
            const newLength = information[i].newLength || '-';
            const newWidth = information[i].newWidth || '-';

            const newPath = [
              contNoAndIdCont,
              jobTask,
              `${information[i].newCom}.${newLoc}.${newDam}.${information[i].newRep}.${newLength}.${newWidth}.${information[i].newQuantity}`,
              imageName,
            ].join('/');

            await this.minIoService.publicUrl();
            await this.minIoService.move(information[i].oldPath, newPath);

            results.push({
              oldUrl: '',
              newUrl: '',
              // oldUrl: `${minioHostGetImage}/${bucketName}/${information[i].oldPath}`,
              // newUrl: `${minioHostGetImage}/${bucketName}/${newPath}`,
            });
          }
        }
      }
    }

    return results;
  }
}
