import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfDay, isAfter } from 'date-fns';
import { Repository } from 'typeorm';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon } from './entities/coupon.entity';

@Injectable()
export class CouponsService {

  constructor(
    @InjectRepository(Coupon) private readonly couponRepository : Repository<Coupon>
  ) {}
  create(createCouponDto: CreateCouponDto) {
    return this.couponRepository.save(createCouponDto)
  }

  findAll() {
    return this.couponRepository.find();
  }

  async findOne(id: number) {
    const coupon = await this.couponRepository.findOneBy({id})
    if (!coupon) {
      throw new NotFoundException(`El cupón con el ID: ${id} no existe`)
    }
    return coupon;
  }

  async update(id: number, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.findOne(id)
    Object.assign(coupon, updateCouponDto)
    return await this.couponRepository.save(coupon)
  }

  async remove(id: number) {
    const coupon = await this.findOne(id)
    await this.couponRepository.remove(coupon)
    return {message: `Cupon eliminado exitosamente`};
  }

  async applyCoupon(name: string) {
    const coupon = await this.couponRepository.findOneBy({name})
    if (!coupon) {
      throw new NotFoundException("El cupón no existe...")
    }
    const currentDate = new Date()
    const expirationDate = endOfDay(coupon.expirationDate)
    if(isAfter(currentDate, expirationDate)) {
      throw new UnprocessableEntityException("Cupón ya expirado")
    }
    return {
      message: "Cupon válido",
      ...coupon
    }
  }
}
